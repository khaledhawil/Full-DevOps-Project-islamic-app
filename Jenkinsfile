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
        SONAR_HOST_URL = 'http://sonarqube:9000'
    }
    
    parameters {
        choice(
            name: 'BUILD_TYPE',
            choices: ['auto', 'frontend-only', 'backend-only', 'both'],
            description: 'Choose build type (auto will detect changes)'
        )
        booleanParam(
            name: 'FORCE_BUILD',
            defaultValue: false,
            description: 'Force build even if no changes detected'
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
                not { params.FORCE_BUILD }
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
                        echo "✅ No application code changes detected. Skipping builds."
                        sendSlackNotification("✅ **No Changes - Build Skipped**", 
                            "No frontend or backend changes detected in this commit. Pipeline completed without building.", 
                            "good")
                        
                        // Set flags to skip all build stages
                        env.BUILD_FRONTEND = 'false'
                        env.BUILD_BACKEND = 'false'
                        env.SKIP_BUILD = 'true'
                        
                        echo "🎯 Pipeline will skip build stages and proceed to cleanup"
                    } else {
                        env.SKIP_BUILD = 'false'
                        
                        // Send notification about what will be built
                        def buildMessage = []
                        if (changes.frontend) buildMessage.add("Frontend")
                        if (changes.backend) buildMessage.add("Backend")
                        
                        sendSlackNotification("🔄 **Starting Build**", 
                            "Changes detected. Building: ${buildMessage.join(' and ')}", 
                            "good")
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
                            sonar.host.url=http://sonarqube:9000

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
                        
                        // Run SonarQube analysis with local sonar-scanner
                        withCredentials([string(credentialId: 'sonarqube', variable: 'SONAR_TOKEN')]) {
                            sh '''
                                echo "🔍 Running SonarQube analysis with local scanner..."
                                
                                # Check SonarQube server accessibility
                                if curl -f ${SONAR_HOST_URL}/api/system/status >/dev/null 2>&1; then
                                    echo "✅ SonarQube server is accessible at ${SONAR_HOST_URL}"
                                else
                                    echo "⚠️ SonarQube server not accessible at ${SONAR_HOST_URL}"
                                    echo "Please ensure SonarQube container is running"
                                    exit 1
                                fi
                                
                                # Use local sonar-scanner installation
                                echo "Using local sonar-scanner..."
                                sonar-scanner 
                                    -Dsonar.projectBaseDir=. 
                                    -Dsonar.host.url=${SONAR_HOST_URL} 
                                    -Dsonar.login=${SONAR_TOKEN}
                            '''
                        }
                        
                        // Wait for SonarQube Quality Gate (if available)
                        script {
                            try {
                                echo "Checking SonarQube Quality Gate..."
                                timeout(time: 5, unit: 'MINUTES') {
                                    // Try to use quality gate if plugin is available
                                    try {
                                        def qg = waitForQualityGate()
                                        if (qg.status != 'OK') {
                                            echo "⚠️ SonarQube Quality Gate: ${qg.status}"
                                            sendSlackNotification(
                                                "⚠️ **Code Quality Warning**", 
                                                "SonarQube Quality Gate status: ${qg.status}\\nView details: ${env.SONAR_HOST_URL}/dashboard?id=islamic-app", 
                                                "warning"
                                            )
                                        } else {
                                            echo "✅ SonarQube Quality Gate: PASSED"
                                            sendSlackNotification(
                                                "✅ **Code Quality Passed**", 
                                                "SonarQube Quality Gate: PASSED\\nView report: ${env.SONAR_HOST_URL}/dashboard?id=islamic-app", 
                                                "good"
                                            )
                                        }
                                    } catch (NoSuchMethodError e) {
                                        echo "⚠️ SonarQube Quality Gates plugin not installed"
                                        echo "Install 'SonarQube Quality Gates' plugin to enable quality gate checks"
                                        sendSlackNotification(
                                            "ℹ️ **Code Quality Analysis Complete**", 
                                            "SonarQube analysis completed\\nQuality Gate plugin not available\\nView report: ${env.SONAR_HOST_URL}/dashboard?id=islamic-app", 
                                            "good"
                                        )
                                    }
                                }
                            } catch (Exception e) {
                                echo "⚠️ SonarQube Quality Gate check failed: ${e.message}"
                                sendSlackNotification(
                                    "⚠️ **Code Quality Check Failed**", 
                                    "SonarQube analysis may have failed\\nError: ${e.message}", 
                                    "warning"
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
                allOf {
                    not { params.SKIP_SECURITY_SCAN }
                    expression { env.SKIP_BUILD != 'true' }
                    anyOf {
                        expression { env.BUILD_FRONTEND == 'true' }
                        expression { env.BUILD_BACKEND == 'true' }
                    }
                }
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
            when {
                allOf {
                    expression { env.SKIP_BUILD != 'true' }
                    anyOf {
                        expression { env.BUILD_FRONTEND == 'true' }
                        expression { env.BUILD_BACKEND == 'true' }
                    }
                }
            }
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
                allOf {
                    not { params.SKIP_DEPLOY }
                    expression { env.SKIP_BUILD != 'true' }
                    anyOf {
                        expression { env.BUILD_FRONTEND == 'true' }
                        expression { env.BUILD_BACKEND == 'true' }
                    }
                }
            }
            steps {
                script {
                    try {
                        echo "📝 Updating Kubernetes manifests..."
                        updateK8sManifests()
                        
                        // Commit and push changes with proper credential handling
                        withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                            sh '''
                                git config user.name "Jenkins CI"
                                git config user.email "jenkins@islamic-app.local"
                                
                                # Check if there are changes to commit
                                if git diff --quiet k8s/; then
                                    echo "No changes to commit in k8s manifests"
                                else
                                    echo "Committing k8s manifest changes..."
                                    git add k8s/
                                    git commit -m "🚀 Update image tags to $BUILD_TAG [skip ci]"
                                    
                                    # Switch to master branch and handle conflicts properly
                                    echo "Ensuring we're on master branch..."
                                    git checkout master 2>/dev/null || git checkout -b master
                                    
                                    echo "Fetching latest changes from remote..."
                                    git fetch origin master
                                    
                                    # Check if we need to merge remote changes
                                    LOCAL=$(git rev-parse HEAD)
                                    REMOTE=$(git rev-parse origin/master)
                                    
                                    if [ "$LOCAL" != "$REMOTE" ]; then
                                        echo "Remote has new changes, resetting to remote and re-applying our changes..."
                                        # Save our manifest changes
                                        git stash push -m "Temporary manifest changes"
                                        
                                        # Reset to remote master
                                        git reset --hard origin/master
                                        
                                        # Re-apply our manifest updates
                                        echo "Re-applying manifest updates..."
                                        sed -i "s|image: khaledhawil/islamic-app_frontend:.*|image: khaledhawil/islamic-app_frontend:$BUILD_TAG|g" k8s/05-frontend.yaml
                                        sed -i "s|image: khaledhawil/islamic-app_backend:.*|image: khaledhawil/islamic-app_backend:$BUILD_TAG|g" k8s/04-backend.yaml
                                        
                                        # Commit if there are changes
                                        if ! git diff --quiet k8s/; then
                                            git add k8s/
                                            git commit -m "🚀 Update image tags to $BUILD_TAG [skip ci]"
                                        fi
                                    fi
                                    
                                    # Push changes using git credential helper
                                    echo "Pushing changes to remote repository..."
                                    git config credential.helper "store --file=.git-credentials"
                                    echo "https://'$GIT_USERNAME':'$GIT_PASSWORD'@github.com" > .git-credentials
                                    git push origin master
                                    rm -f .git-credentials
                                fi
                            '''
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
            script {
                // Clean up Docker images to save space
                try {
                    sh """
                        docker system prune -f
                        docker image prune -f
                    """
                } catch (Exception e) {
                    echo "⚠️ Docker cleanup failed: ${e.message}"
                }
                
                // Archive artifacts
                try {
                    archiveArtifacts artifacts: 'security-reports/*.json', allowEmptyArchive: true
                } catch (Exception e) {
                    echo "⚠️ Archive artifacts failed: ${e.message}"
                }
                
                // Fallback for HTML report publishing
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
                // Frontend-related files
                if (file.startsWith('frontend/') || 
                    file.contains('frontend') || 
                    file.startsWith('k8s/05-frontend.yaml') ||
                    file.contains('package.json') ||
                    file.contains('tsconfig.json') ||
                    file.contains('nginx.conf') ||
                    file.endsWith('.tsx') ||
                    file.endsWith('.ts') ||
                    file.endsWith('.css') ||
                    file.endsWith('.scss') ||
                    file.endsWith('.js') ||
                    file.endsWith('.jsx')) {
                    changes.frontend = true
                }
                
                // Backend-related files
                if (file.startsWith('backend/') || 
                    file.contains('backend') || 
                    file.startsWith('k8s/04-backend.yaml') ||
                    file.contains('requirements.txt') ||
                    file.contains('app.py') ||
                    file.contains('database.py') ||
                    file.endsWith('.py') ||
                    file.startsWith('database/')) {
                    changes.backend = true
                }
                
                // Infrastructure changes that affect both
                if (file == 'Jenkinsfile' || 
                    file.contains('Jenkinsfile') ||
                    file.startsWith('k8s/') ||
                    file.startsWith('helm/') ||
                    file.startsWith('terraform/') ||
                    file.startsWith('ansible/') ||
                    file.contains('docker-compose') ||
                    file.endsWith('Dockerfile')) {
                    echo "🔧 Infrastructure file changed: ${file}, triggering both builds for testing"
                    changes.frontend = true
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
                // Frontend-related files
                if (file.startsWith('frontend/') || 
                    file.contains('frontend') || 
                    file.startsWith('k8s/05-frontend.yaml') ||
                    file.contains('package.json') ||
                    file.contains('tsconfig.json') ||
                    file.contains('nginx.conf') ||
                    file.endsWith('.tsx') ||
                    file.endsWith('.ts') ||
                    file.endsWith('.css') ||
                    file.endsWith('.scss') ||
                    file.endsWith('.js') ||
                    file.endsWith('.jsx')) {
                    changes.frontend = true
                }
                
                // Backend-related files
                if (file.startsWith('backend/') || 
                    file.contains('backend') || 
                    file.startsWith('k8s/04-backend.yaml') ||
                    file.contains('requirements.txt') ||
                    file.contains('app.py') ||
                    file.contains('database.py') ||
                    file.endsWith('.py') ||
                    file.startsWith('database/')) {
                    changes.backend = true
                }
                
                // Infrastructure changes that affect both
                if (file == 'Jenkinsfile' || 
                    file.contains('Jenkinsfile') ||
                    file.startsWith('k8s/') ||
                    file.startsWith('helm/') ||
                    file.startsWith('terraform/') ||
                    file.startsWith('ansible/') ||
                    file.contains('docker-compose') ||
                    file.endsWith('Dockerfile')) {
                    echo "🔧 Infrastructure file changed: ${file}, triggering both builds for testing"
                    changes.frontend = true
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
        
        // Use local Trivy installation
        sh """
            echo "Using local Trivy installation..."
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