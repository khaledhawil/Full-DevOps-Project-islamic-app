pipeline {
    agent any
    
    environment {
        DOCKER_REGISTRY = 'khaledhawil'
        PROJECT_NAME = 'islamic-app'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}_frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}_backend"
        DISCORD_WEBHOOK = credentials('discord')
        DOCKER_CREDENTIALS = credentials('dockerhub')
        GIT_CREDENTIALS = credentials('github-credentials')
        TRIVY_VERSION = '0.48.0'
    }
    
    parameters {
        choice(
            name: 'BUILD_TYPE',
            choices: ['auto', 'frontend-only', 'backend-only', 'both'],
            description: 'Choose build type (auto will detect changes)'
        )
        booleanParam(
            name: 'SKIP_SECURITY_SCAN',
            defaultValue: false,
            description: 'Skip security scanning'
        )
        booleanParam(
            name: 'SKIP_DEPLOY',
            defaultValue: false,
            description: 'Skip deployment update'
        )
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    // Clean workspace and checkout
                    deleteDir()
                    checkout scm
                    
                    // Get commit info
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                    
                    // Send build start notification
                    sendDiscordNotification("🚀 **Build Started**", "Build #${env.BUILD_NUMBER} started for commit `${env.GIT_COMMIT_SHORT}`", "info")
                }
            }
        }
        
        stage('Detect Changes') {
            when {
                expression { params.BUILD_TYPE == 'auto' }
            }
            steps {
                script {
                    def changes = detectChanges()
                    env.BUILD_FRONTEND = changes.frontend.toString()
                    env.BUILD_BACKEND = changes.backend.toString()
                    
                    echo "🔍 Change Detection Results:"
                    echo "Frontend changes: ${env.BUILD_FRONTEND}"
                    echo "Backend changes: ${env.BUILD_BACKEND}"
                    
                    if (!changes.frontend && !changes.backend) {
                        echo "⚠️ No significant changes detected. Skipping build."
                        sendDiscordNotification("⚠️ **No Changes**", "No significant changes detected in this commit.", "warning")
                        currentBuild.result = 'SUCCESS'
                        return
                    }
                }
            }
        }
        
        stage('Set Build Flags') {
            steps {
                script {
                    switch(params.BUILD_TYPE) {
                        case 'frontend-only':
                            env.BUILD_FRONTEND = 'true'
                            env.BUILD_BACKEND = 'false'
                            break
                        case 'backend-only':
                            env.BUILD_FRONTEND = 'false'
                            env.BUILD_BACKEND = 'true'
                            break
                        case 'both':
                            env.BUILD_FRONTEND = 'true'
                            env.BUILD_BACKEND = 'true'
                            break
                    }
                    
                    echo "📋 Build Configuration:"
                    echo "Build Frontend: ${env.BUILD_FRONTEND}"
                    echo "Build Backend: ${env.BUILD_BACKEND}"
                }
            }
        }
        
        stage('Build Frontend') {
            when {
                expression { env.BUILD_FRONTEND == 'true' }
            }
            steps {
                script {
                    try {
                        echo "🏗️ Building Frontend..."
                        
                        dir('frontend') {
                            // Build Docker image
                            def frontendImage = docker.build("${FRONTEND_IMAGE}:${env.BUILD_TAG}")
                            
                            // Tag as latest
                            sh "docker tag ${FRONTEND_IMAGE}:${env.BUILD_TAG} ${FRONTEND_IMAGE}:latest"
                            
                            env.FRONTEND_IMAGE_TAG = env.BUILD_TAG
                            echo "✅ Frontend build completed: ${FRONTEND_IMAGE}:${env.BUILD_TAG}"
                        }
                    } catch (Exception e) {
                        sendDiscordNotification("❌ **Frontend Build Failed**", "Frontend build failed: ${e.message}", "error")
                        throw e
                    }
                }
            }
        }
        
        stage('Build Backend') {
            when {
                expression { env.BUILD_BACKEND == 'true' }
            }
            steps {
                script {
                    try {
                        echo "🏗️ Building Backend..."
                        
                        dir('backend') {
                            // Build Docker image
                            def backendImage = docker.build("${BACKEND_IMAGE}:${env.BUILD_TAG}")
                            
                            // Tag as latest
                            sh "docker tag ${BACKEND_IMAGE}:${env.BUILD_TAG} ${BACKEND_IMAGE}:latest"
                            
                            env.BACKEND_IMAGE_TAG = env.BUILD_TAG
                            echo "✅ Backend build completed: ${BACKEND_IMAGE}:${env.BUILD_TAG}"
                        }
                    } catch (Exception e) {
                        sendDiscordNotification("❌ **Backend Build Failed**", "Backend build failed: ${e.message}", "error")
                        throw e
                    }
                }
            }
        }
        
        stage('Security Scan') {
            when {
                not { params.SKIP_SECURITY_SCAN }
            }
            parallel {
                stage('Scan Frontend') {
                    when {
                        expression { env.BUILD_FRONTEND == 'true' }
                    }
                    steps {
                        script {
                            scanImage("${FRONTEND_IMAGE}:${env.BUILD_TAG}", "frontend")
                        }
                    }
                }
                
                stage('Scan Backend') {
                    when {
                        expression { env.BUILD_BACKEND == 'true' }
                    }
                    steps {
                        script {
                            scanImage("${BACKEND_IMAGE}:${env.BUILD_TAG}", "backend")
                        }
                    }
                }
            }
        }
        
        stage('Push Images') {
            parallel {
                stage('Push Frontend') {
                    when {
                        expression { env.BUILD_FRONTEND == 'true' }
                    }
                    steps {
                        script {
                            docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                                sh "docker push ${FRONTEND_IMAGE}:${env.BUILD_TAG}"
                                sh "docker push ${FRONTEND_IMAGE}:latest"
                            }
                            echo "✅ Frontend image pushed: ${FRONTEND_IMAGE}:${env.BUILD_TAG}"
                        }
                    }
                }
                
                stage('Push Backend') {
                    when {
                        expression { env.BUILD_BACKEND == 'true' }
                    }
                    steps {
                        script {
                            docker.withRegistry('https://registry.hub.docker.com', 'dockerhub') {
                                sh "docker push ${BACKEND_IMAGE}:${env.BUILD_TAG}"
                                sh "docker push ${BACKEND_IMAGE}:latest"
                            }
                            echo "✅ Backend image pushed: ${BACKEND_IMAGE}:${env.BUILD_TAG}"
                        }
                    }
                }
            }
        }
        
        stage('Update K8s Manifests') {
            when {
                not { params.SKIP_DEPLOY }
            }
            steps {
                script {
                    try {
                        echo "📝 Updating Kubernetes manifests..."
                        updateK8sManifests()
                        
                        // Commit and push changes
                        withCredentials([gitUsernamePassword(credentialsId: 'git-credentials')]) {
                            sh """
                                git config user.name "Jenkins CI"
                                git config user.email "jenkins@islamic-app.local"
                                git add k8s/
                                git commit -m "🚀 Update image tags to ${env.BUILD_TAG} [skip ci]" || echo "No changes to commit"
                                git push origin HEAD:master
                            """
                        }
                        
                        echo "✅ Kubernetes manifests updated and pushed"
                    } catch (Exception e) {
                        sendDiscordNotification("❌ **K8s Update Failed**", "Failed to update Kubernetes manifests: ${e.message}", "error")
                        throw e
                    }
                }
            }
        }
        
       
    post {
        success {
            script {
                def message = "✅ **Build Successful**\n"
                message += "Build #${env.BUILD_NUMBER} completed successfully!\n\n"
                
                if (env.BUILD_FRONTEND == 'true') {
                    message += "🎨 Frontend: `${FRONTEND_IMAGE}:${env.BUILD_TAG}`\n"
                }
                if (env.BUILD_BACKEND == 'true') {
                    message += "⚙️ Backend: `${BACKEND_IMAGE}:${env.BUILD_TAG}`\n"
                }
                
                message += "\n🔗 [View Build](${env.BUILD_URL})"
                
                sendDiscordNotification("✅ **Build Successful**", message, "success")
            }
        }
        
        failure {
            script {
                def message = "❌ **Build Failed**\n"
                message += "Build #${env.BUILD_NUMBER} failed at stage: ${env.STAGE_NAME}\n\n"
                message += "🔗 [View Build Logs](${env.BUILD_URL}console)"
                
                sendDiscordNotification("❌ **Build Failed**", message, "error")
            }
        }
        
        always {
            // Clean up Docker images to save space
            script {
                try {
                    sh """
                        docker system prune -f
                        docker image prune -f
                    """
                } catch (Exception e) {
                    echo "⚠️ Docker cleanup failed: ${e.message}"
                }
            }
            
            // Archive artifacts
            archiveArtifacts artifacts: 'security-reports/*.json', allowEmptyArchive: true
            
            // Publish security scan results
            publishHTML([
                allowMissing: false,
                alwaysLinkToLastBuild: true,
                keepAll: true,
                reportDir: 'security-reports',
                reportFiles: '*.html',
                reportName: 'Security Scan Report'
            ])
        }
    }
}

// Helper Functions
def detectChanges() {
    def changes = [frontend: false, backend: false]
    
    try {
        // Get changed files since last successful build
        def lastSuccessfulCommit = sh(
            script: '''
                git log --format="%H" --grep="\\[skip ci\\]" --invert-grep -n 1 HEAD~1 2>/dev/null || git rev-parse HEAD~1 2>/dev/null || echo ""
            ''',
            returnStdout: true
        ).trim()
        
        if (lastSuccessfulCommit) {
            def changedFiles = sh(
                script: "git diff --name-only ${lastSuccessfulCommit} HEAD",
                returnStdout: true
            ).trim().split('\n')
            
            echo "📁 Changed files: ${changedFiles.join(', ')}"
            
            changedFiles.each { file ->
                if (file.startsWith('frontend/') || file.startsWith('k8s/05-frontend.yaml')) {
                    changes.frontend = true
                }
                if (file.startsWith('backend/') || file.startsWith('k8s/04-backend.yaml')) {
                    changes.backend = true
                }
            }
        } else {
            echo "⚠️ Could not determine last commit, building both"
            changes.frontend = true
            changes.backend = true
        }
    } catch (Exception e) {
        echo "⚠️ Error detecting changes: ${e.message}, building both"
        changes.frontend = true
        changes.backend = true
    }
    
    return changes
}

def scanImage(imageName, component) {
    try {
        echo "🔍 Scanning ${component} image: ${imageName}"
        
        // Install Trivy if not exists
        sh """
            if ! command -v trivy &> /dev/null; then
                echo "Installing Trivy..."
                wget -O - https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b /usr/local/bin v${TRIVY_VERSION}
            fi
        """
        
        // Create reports directory
        sh "mkdir -p security-reports"
        
        // Run security scan
        sh """
            trivy image --format json --output security-reports/${component}-scan.json ${imageName}
            trivy image --format table ${imageName} | tee security-reports/${component}-scan.txt
        """
        
        // Check for HIGH/CRITICAL vulnerabilities
        def criticalVulns = sh(
            script: "trivy image --severity HIGH,CRITICAL --format json ${imageName} | jq '.Results[]?.Vulnerabilities // [] | length' | awk '{sum += \$1} END {print sum+0}'",
            returnStdout: true
        ).trim().toInteger()
        
        if (criticalVulns > 0) {
            echo "⚠️ Found ${criticalVulns} HIGH/CRITICAL vulnerabilities in ${component}"
            sendDiscordNotification(
                "⚠️ **Security Alert**", 
                "Found ${criticalVulns} HIGH/CRITICAL vulnerabilities in ${component} image", 
                "warning"
            )
        } else {
            echo "✅ No HIGH/CRITICAL vulnerabilities found in ${component}"
        }
        
    } catch (Exception e) {
        echo "⚠️ Security scan failed for ${component}: ${e.message}"
        sendDiscordNotification(
            "⚠️ **Scan Failed**", 
            "Security scan failed for ${component}: ${e.message}", 
            "warning"
        )
    }
}

def updateK8sManifests() {
    if (env.BUILD_FRONTEND == 'true') {
        sh """
            sed -i 's|image: ${FRONTEND_IMAGE}:.*|image: ${FRONTEND_IMAGE}:${env.BUILD_TAG}|g' k8s/05-frontend.yaml
        """
        echo "✅ Updated frontend image tag in k8s/05-frontend.yaml"
    }
    
    if (env.BUILD_BACKEND == 'true') {
        sh """
            sed -i 's|image: ${BACKEND_IMAGE}:.*|image: ${BACKEND_IMAGE}:${env.BUILD_TAG}|g' k8s/04-backend.yaml
        """
        echo "✅ Updated backend image tag in k8s/04-backend.yaml"
    }
}

def sendDiscordNotification(title, message, type = "info") {
    def color = [
        "info": 3447003,    // Blue
        "success": 65280,   // Green
        "warning": 16776960, // Yellow
        "error": 16711680   // Red
    ][type] ?: 3447003
    
    def payload = [
        embeds: [[
            title: title,
            description: message,
            color: color,
            timestamp: new Date().format("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'"),
            footer: [
                text: "Jenkins CI/CD Pipeline",
                icon_url: "https://www.jenkins.io/images/logos/jenkins/jenkins.png"
            ],
            fields: [
                [
                    name: "Project",
                    value: env.PROJECT_NAME,
                    inline: true
                ],
                [
                    name: "Branch",
                    value: env.BRANCH_NAME ?: "master",
                    inline: true
                ],
                [
                    name: "Build",
                    value: "#${env.BUILD_NUMBER}",
                    inline: true
                ]
            ]
        ]]
    ]
    
    try {
        httpRequest(
            httpMode: 'POST',
            url: env.DISCORD_WEBHOOK,
            contentType: 'APPLICATION_JSON',
            requestBody: groovy.json.JsonBuilder(payload).toString()
        )
    } catch (Exception e) {
        echo "⚠️ Failed to send Discord notification: ${e.message}"
    }
}
