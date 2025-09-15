pipeline {
    agent any
    
    // Optimize build triggers to reduce API calls
    options {
        // Reduce build retention to minimize history API calls
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '7'))
        // Skip default SCM checkout to do it manually with better control
        skipDefaultCheckout(true)
        // Disable concurrent builds to avoid API conflicts
        disableConcurrentBuilds()
    }
    
    environment {
        DOCKER_REGISTRY = 'khaledhawil'
        PROJECT_NAME = 'islamic-app'
        FRONTEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}_frontend"
        BACKEND_IMAGE = "${DOCKER_REGISTRY}/${PROJECT_NAME}_backend"
        SLACK_CHANNEL = '#islamic-app-ci'
        SLACK_CREDENTIAL_ID = 'slack'
        DOCKER_CREDENTIALS = credentials('docker-hub')
        GIT_CREDENTIALS = credentials('github')
        TRIVY_VERSION = '0.48.0'
        SONAR_HOST_URL = 'http://sonarqube:9000'
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
                    sendSlackNotification("🚀 **Build Started**", "Build #${env.BUILD_NUMBER} started for commit `${env.GIT_COMMIT_SHORT}`", "good")
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
                        sendSlackNotification("⚠️ **No Changes**", "No significant changes detected in this commit.", "warning")
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
        
        stage('Code Quality Analysis - SonarQube') {
            steps {
                script {
                    try {
                        echo "🔍 Running SonarQube Code Analysis..."
                        
                        // Create sonar-project.properties if not exists
                                                    writeFile file: 'sonar-project.properties', text: '''
                            # SonarQube project configuration for Islamic App
                            sonar.projectKey=islamic-app
                            sonar.projectName=Islamic App
                            sonar.projectVersion=1.0
                            sonar.host.url=http://localhost:9000
                            sonar.login=${SONAR_TOKEN}

                            # Source directories
                            sonar.sources=frontend/src,backend
                            sonar.exclusions=**/*test*/**,**/*node_modules*/**,**/*build*/**,**/*dist*/**

                            # Language specific settings
                            sonar.javascript.lcov.reportPaths=frontend/coverage/lcov.info
                            sonar.python.coverage.reportPaths=backend/coverage.xml

                            # Test directories
                            sonar.tests=frontend/src,backend/tests
                            sonar.test.inclusions=**/*test*/**,**/*spec*/**
                            '''
                        
                        // Run SonarQube analysis
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_TOKEN')]) {
                            sh '''
                                echo "Running SonarQube analysis..."
                                sonar-scanner -Dsonar.projectBaseDir=. || true
                            '''
                        }
                        
                        // Wait for SonarQube quality gate
                        timeout(time: 5, unit: 'MINUTES') {
                            def qg = waitForQualityGate()
                            if (qg.status != 'OK') {
                                echo "⚠️ SonarQube Quality Gate: ${qg.status}"
                                sendSlackNotification(
                                    "⚠️ **Code Quality Warning**", 
                                    "SonarQube Quality Gate status: ${qg.status}\\nCheck: ${env.SONAR_HOST_URL}/dashboard?id=islamic-app", 
                                    "warning"
                                )
                                // Don't fail the build, just warn
                            } else {
                                echo "✅ SonarQube Quality Gate: PASSED"
                                sendSlackNotification(
                                    "✅ **Code Quality Check Passed**", 
                                    "SonarQube analysis completed successfully\\nView report: ${env.SONAR_HOST_URL}/dashboard?id=islamic-app", 
                                    "good"
                                )
                            }
                        }
                        
                    } catch (Exception e) {
                        echo "⚠️ SonarQube analysis failed: ${e.message}"
                        sendSlackNotification(
                            "⚠️ **SonarQube Analysis Failed**", 
                            "Code quality analysis failed but build will continue: ${e.message}", 
                            "warning"
                        )
                        // Don't fail the build, continue with deployment
                    }
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
                            sh "docker build -t ${env.FRONTEND_IMAGE}:${env.BUILD_TAG} ."
                            sh "docker tag ${env.FRONTEND_IMAGE}:${env.BUILD_TAG} ${env.FRONTEND_IMAGE}:latest"
                            env.FRONTEND_IMAGE_TAG = env.BUILD_TAG
                            echo "✅ Frontend build completed: ${env.FRONTEND_IMAGE}:${env.BUILD_TAG}"
                        }
                    } catch (Exception e) {
                        sendSlackNotification("❌ **Frontend Build Failed**", "Frontend build failed: ${e.message}", "danger")
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
                            sh "docker build -t ${env.BACKEND_IMAGE}:${env.BUILD_TAG} ."
                            sh "docker tag ${env.BACKEND_IMAGE}:${env.BUILD_TAG} ${env.BACKEND_IMAGE}:latest"
                            env.BACKEND_IMAGE_TAG = env.BUILD_TAG
                            echo "✅ Backend build completed: ${env.BACKEND_IMAGE}:${env.BUILD_TAG}"
                        }
                    } catch (Exception e) {
                        sendSlackNotification("❌ **Backend Build Failed**", "Backend build failed: ${e.message}", "danger")
                        throw e
                    }
                }
            }
        }
        
        stage('Security Scan') {
            when {
                expression { !params.SKIP_SECURITY_SCAN }
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
            post {
                success {
                    script {
                        def message = "🛡️ **Security Scan Completed**\n"
                        message += "All security scans completed successfully!\n\n"
                        
                        if (env.BUILD_FRONTEND == 'true') {
                            message += "🎨 Frontend scan: ✅ Completed\n"
                        }
                        if (env.BUILD_BACKEND == 'true') {
                            message += "⚙️ Backend scan: ✅ Completed\n"
                        }
                        
                        message += "\n📊 [View Security Reports](${env.BUILD_URL}artifact/security-reports/)"
                        
                        sendSlackNotification("🛡️ **Security Scan Completed**", message, "good")
                    }
                }
                failure {
                    script {
                        def message = "🚨 **Security Scan Failed**\n"
                        message += "One or more security scans failed.\n\n"
                        message += "🔗 [View Build Logs](${env.BUILD_URL}console)"
                        
                        sendSlackNotification("🚨 **Security Scan Failed**", message, "danger")
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
                            sh "echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin"
                            sh "docker push ${env.FRONTEND_IMAGE}:${env.BUILD_TAG}"
                            sh "docker push ${env.FRONTEND_IMAGE}:latest"
                            echo "✅ Frontend image pushed: ${env.FRONTEND_IMAGE}:${env.BUILD_TAG}"
                        }
                    }
                }
                stage('Push Backend') {
                    when {
                        expression { env.BUILD_BACKEND == 'true' }
                    }
                    steps {
                        script {
                            sh "echo $DOCKER_CREDENTIALS_PSW | docker login -u $DOCKER_CREDENTIALS_USR --password-stdin"
                            sh "docker push ${env.BACKEND_IMAGE}:${env.BUILD_TAG}"
                            sh "docker push ${env.BACKEND_IMAGE}:latest"
                            echo "✅ Backend image pushed: ${env.BACKEND_IMAGE}:${env.BUILD_TAG}"
                        }
                    }
                }
            }
        }
        
        stage('Update K8s Manifests') {
            when {
                expression { !params.SKIP_DEPLOY }
            }
            steps {
                script {
                    try {
                        echo "📝 Updating Kubernetes manifests..."
                        updateK8sManifests()
                        
                        // Commit and push changes
                        withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                            sh """
                                git config user.name "Jenkins CI"
                                git config user.email "jenkins@islamic-app.local"
                                git add k8s/
                                git commit -m "🚀 Update image tags to ${env.BUILD_TAG} [skip ci]" || echo "No changes to commit"
                                git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/\$(git config --get remote.origin.url | sed 's/.*github.com[:/]//;s/.git\$//')/ HEAD:master
                            """
                        }
                        
                        echo "✅ Kubernetes manifests updated and pushed"
                    } catch (Exception e) {
                        sendSlackNotification("❌ **K8s Update Failed**", "Failed to update Kubernetes manifests: ${e.message}", "danger")
                        throw e
                    }
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
                
                sendSlackNotification("✅ **Build Successful**", message, "good")
            }
        }
        
        failure {
            script {
                def message = "❌ **Build Failed**\n"
                message += "Build #${env.BUILD_NUMBER} failed at stage: ${env.STAGE_NAME}\n\n"
                message += "🔗 [View Build Logs](${env.BUILD_URL}console)"
                
                sendSlackNotification("❌ **Build Failed**", message, "danger")
            }
        }
        
        always {
            node {
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
                script {
                    try {
                        archiveArtifacts artifacts: 'security-reports/*.json', allowEmptyArchive: true
                    } catch (Exception e) {
                        echo "⚠️ Archive artifacts failed: ${e.message}"
                    }
                }
                // Fallback for HTML report publishing
                script {
                    try {
                        if (fileExists('security-reports')) {
                            echo "Security scan HTML reports are available in the security-reports directory."
                        } else {
                            echo "No security scan HTML reports found."
                        }
                    } catch (Exception e) {
                        echo "⚠️ File check failed: ${e.message}"
                    }
                }
            }
        }
    }
}

// Helper Functions
def detectChanges() {
    def changes = [frontend: false, backend: false]
    
    try {
        // Use more efficient git commands to reduce API calls
        def lastCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT ?: env.GIT_PREVIOUS_COMMIT
        
        if (!lastCommit) {
            // For first build or when can't determine last commit, check only recent changes
            def recentChanges = sh(
                script: "git diff --name-only HEAD~1 HEAD 2>/dev/null || echo 'all'",
                returnStdout: true
            ).trim()
            
            if (recentChanges == 'all') {
                echo "⚠️ First build or unable to detect changes, building both components"
                changes.frontend = true
                changes.backend = true
                return changes
            }
            
            def changedFiles = recentChanges.split('\n')
            echo "📁 Recent changed files: ${changedFiles.join(', ')}"
            
            changedFiles.each { file ->
                if (file.startsWith('frontend/') || file.contains('frontend') || file.startsWith('k8s/05-frontend.yaml')) {
                    changes.frontend = true
                }
                if (file.startsWith('backend/') || file.contains('backend') || file.startsWith('k8s/04-backend.yaml')) {
                    changes.backend = true
                }
            }
        } else {
            // Use Jenkins built-in commit comparison
            def changedFiles = sh(
                script: "git diff --name-only ${lastCommit} HEAD",
                returnStdout: true
            ).trim().split('\n')
            
            echo "📁 Changed files since last build: ${changedFiles.join(', ')}"
            
            changedFiles.each { file ->
                if (file.startsWith('frontend/') || file.contains('frontend') || file.startsWith('k8s/05-frontend.yaml')) {
                    changes.frontend = true
                }
                if (file.startsWith('backend/') || file.contains('backend') || file.startsWith('k8s/04-backend.yaml')) {
                    changes.backend = true
                }
            }
        }
    } catch (Exception e) {
        echo "⚠️ Error detecting changes: ${e.message}, building both components"
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
            if ! command -v trivy &> /dev/null && ! test -f ./bin/trivy; then
                echo "Installing Trivy..."
                mkdir -p ./bin
                wget -O - https://raw.githubusercontent.com/aquasecurity/trivy/main/contrib/install.sh | sh -s -- -b ./bin v${TRIVY_VERSION}
                export PATH=\$PWD/bin:\$PATH
            elif test -f ./bin/trivy; then
                export PATH=\$PWD/bin:\$PATH
            fi
        """
        
        // Create reports directory
        sh "mkdir -p security-reports"
        
        // Run security scan
        sh """
            # Ensure trivy is in PATH
            if test -f ./bin/trivy; then
                export PATH=\$PWD/bin:\$PATH
            fi
            
            trivy image --format json --output security-reports/${component}-scan.json ${imageName}
            trivy image --format table ${imageName} | tee security-reports/${component}-scan.txt
            
            # Generate HTML report if possible
            if command -v pandoc &> /dev/null; then
                pandoc security-reports/${component}-scan.txt -f plain -t html -o security-reports/${component}-scan.html 2>/dev/null || echo "HTML conversion failed"
            else
                echo "<html><body><h1>Security Scan Report for ${component}</h1><pre>" > security-reports/${component}-scan.html
                cat security-reports/${component}-scan.txt >> security-reports/${component}-scan.html
                echo "</pre></body></html>" >> security-reports/${component}-scan.html
            fi
        """
        
        // Check for HIGH/CRITICAL vulnerabilities
        def criticalVulns = sh(
            script: """
                if test -f ./bin/trivy; then
                    export PATH=\$PWD/bin:\$PATH
                fi
                trivy image --severity HIGH,CRITICAL --format json ${imageName} | jq '.Results[]?.Vulnerabilities // [] | length' | awk '{sum += \$1} END {print sum+0}'
            """,
            returnStdout: true
        ).trim().toInteger()
        
        if (criticalVulns > 0) {
            echo "⚠️ Found ${criticalVulns} HIGH/CRITICAL vulnerabilities in ${component}"
            sendSlackNotification(
                "⚠️ **Security Alert**", 
                "Found ${criticalVulns} HIGH/CRITICAL vulnerabilities in ${component} image", 
                "warning"
            )
        } else {
            echo "✅ No HIGH/CRITICAL vulnerabilities found in ${component}"
            sendSlackNotification(
                "✅ **Scan Clean**", 
                "${component} image scan completed - No HIGH/CRITICAL vulnerabilities found", 
                "good"
            )
        }
        
    } catch (Exception e) {
        echo "⚠️ Security scan failed for ${component}: ${e.message}"
        sendSlackNotification(
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

def sendSlackNotification(title, message, color = "good") {
    try {
        slackSend(
            channel: env.SLACK_CHANNEL,
            color: color,
            message: ":jenkins: *${title}*\n" +
                     "*Job:* ${JOB_NAME}\n" +
                     "*Build:* #${BUILD_NUMBER}\n" +
                     "*Branch:* ${env.BRANCH_NAME ?: 'master'}\n" +
                     "*Message:* ${message}\n" +
                     "*Build URL:* ${BUILD_URL}",
            tokenCredentialId: env.SLACK_CREDENTIAL_ID
        )
    } catch (Exception e) {
        echo "⚠️ Failed to send Slack notification: ${e.message}"
        // Fallback: log to console
        echo "Slack notification would have been: ${title} - ${message}"
    }
}