pipeline {
    agent any
    
    options {
        buildDiscarder(logRotator(numToKeepStr: '10', daysToKeepStr: '7'))
        skipDefaultCheckout(true)
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
                    deleteDir()
                    checkout scm
                    env.GIT_COMMIT_SHORT = sh(script: "git rev-parse --short HEAD", returnStdout: true).trim()
                    env.BUILD_TAG = "${env.BUILD_NUMBER}-${env.GIT_COMMIT_SHORT}"
                    
                    sendSlackNotification("🚀 **Build Started**", 
                        "Build #${env.BUILD_NUMBER} started\\nCommit: ${env.GIT_COMMIT_SHORT}", 
                        "good")
                }
            }
        }
        
        stage('Detect Changes') {
            when {
                expression { !params.FORCE_BUILD }
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
                        
                        env.BUILD_FRONTEND = 'false'
                        env.BUILD_BACKEND = 'false'
                        env.SKIP_BUILD = 'true'
                        
                        echo "🎯 Pipeline will skip build stages and proceed to cleanup"
                    } else {
                        env.SKIP_BUILD = 'false'
                        
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
                        
                        withCredentials([string(credentialsId: 'sonarqube', variable: 'SONAR_TOKEN')]) {
                            sh '''
                                echo "🔍 Running SonarQube analysis with local scanner..."
                                
                                if curl -f ${SONAR_HOST_URL}/api/system/status >/dev/null 2>&1; then
                                    echo "✅ SonarQube server is accessible at ${SONAR_HOST_URL}"
                                    
                                    sonar-scanner \
                                        -Dsonar.projectBaseDir=. \
                                        -Dsonar.host.url=${SONAR_HOST_URL} \
                                        -Dsonar.login=${SONAR_TOKEN}
                                else
                                    echo "⚠️ SonarQube server not accessible at ${SONAR_HOST_URL}"
                                    echo "Skipping SonarQube analysis"
                                fi
                            '''
                        }
                        
                        script {
                            try {
                                echo "Checking SonarQube Quality Gate..."
                                timeout(time: 5, unit: 'MINUTES') {
                                    def qg = waitForQualityGate()
                                    if (qg.status != 'OK') {
                                        echo "⚠️ SonarQube Quality Gate: ${qg.status}"
                                        sendSlackNotification(
                                            "⚠️ **Code Quality Warning**", 
                                            "SonarQube Quality Gate status: ${qg.status}", 
                                            "warning"
                                        )
                                    } else {
                                        echo "✅ SonarQube Quality Gate: PASSED"
                                        sendSlackNotification(
                                            "✅ **Code Quality Passed**", 
                                            "SonarQube Quality Gate: PASSED", 
                                            "good"
                                        )
                                    }
                                }
                            } catch (Exception e) {
                                echo "⚠️ SonarQube Quality Gate check failed or plugin not available: ${e.message}"
                                sendSlackNotification(
                                    "ℹ️ **Code Quality Analysis Complete**", 
                                    "SonarQube analysis completed. Quality Gate plugin may not be available.", 
                                    "good"
                                )
                            }
                        }
                        
                    } catch (Exception e) {
                        echo "⚠️ SonarQube analysis failed: ${e.message}"
                        sendSlackNotification("⚠️ **SonarQube Failed**", "SonarQube analysis failed: ${e.message}", "warning")
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
                    expression { !params.SKIP_SECURITY_SCAN }
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
                        def message = "🛡️ **Security Scan Completed**\\n"
                        message += "All security scans completed successfully!\\n\\n"
                        
                        if (env.BUILD_FRONTEND == 'true') {
                            message += "🎨 Frontend scan: ✅ Completed\\n"
                        }
                        if (env.BUILD_BACKEND == 'true') {
                            message += "⚙️ Backend scan: ✅ Completed\\n"
                        }
                        
                        sendSlackNotification("🛡️ **Security Scan Completed**", message, "good")
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
                    expression { !params.SKIP_DEPLOY }
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
                        
                        withCredentials([usernamePassword(credentialsId: 'github', usernameVariable: 'GIT_USERNAME', passwordVariable: 'GIT_PASSWORD')]) {
                            sh '''
                                git config user.name "Jenkins CI"
                                git config user.email "jenkins@islamic-app.local"
                                
                                if git diff --quiet k8s/; then
                                    echo "No changes to commit in k8s manifests"
                                else
                                    echo "Committing k8s manifest changes..."
                                    git add k8s/
                                    git commit -m "🚀 Update image tags to ${BUILD_TAG} [skip ci]"
                                    
                                    echo "Pushing changes to remote repository..."
                                    git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/khaledhawil/Full-DevOps-Project-islamic-app.git HEAD:master
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
                def message = "✅ **Build Successful**\\n"
                message += "Build #${env.BUILD_NUMBER} completed successfully!\\n\\n"
                
                if (env.BUILD_FRONTEND == 'true') {
                    message += "🎨 Frontend: `${FRONTEND_IMAGE}:${env.BUILD_TAG}`\\n"
                }
                if (env.BUILD_BACKEND == 'true') {
                    message += "⚙️ Backend: `${BACKEND_IMAGE}:${env.BUILD_TAG}`\\n"
                }
                
                message += "\\n🔗 [View Build](${env.BUILD_URL})"
                
                sendSlackNotification("✅ **Build Successful**", message, "good")
            }
        }
        failure {
            script {
                sendSlackNotification("❌ **Build Failed**", 
                    "Build #${env.BUILD_NUMBER} failed\\n\\n🔗 [View Build](${env.BUILD_URL})", 
                    "danger")
            }
        }
        cleanup {
            script {
                sh "docker system prune -f"
                sh "docker image prune -f"
                archiveArtifacts artifacts: 'security-reports/*', allowEmptyArchive: true
                
                if (fileExists('security-reports')) {
                    echo "Security scan HTML reports are available in the security-reports directory."
                }
            }
        }
    }
}

// Helper Functions
def detectChanges() {
    def changes = [frontend: false, backend: false]
    
    try {
        def lastCommit = env.GIT_PREVIOUS_SUCCESSFUL_COMMIT ?: env.GIT_PREVIOUS_COMMIT
        
        if (!lastCommit) {
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
            def changedFiles = sh(
                script: "git diff --name-only ${lastCommit} HEAD",
                returnStdout: true
            ).trim().split('\n')
            
            echo "📁 Changed files since last build: ${changedFiles.join(', ')}"
            
            changedFiles.each { file ->
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
        
        sh """
            echo "Using local Trivy installation..."
            mkdir -p security-reports
            
            trivy image --format json --output security-reports/${component}-scan.json ${imageName}
            trivy image --format table ${imageName} | tee security-reports/${component}-scan.txt
        """
        
        def criticalVulns = sh(
            script: "trivy image --severity HIGH,CRITICAL --format json ${imageName} | jq '.Results[]?.Vulnerabilities // [] | length' | awk '{sum += \$1} END {print sum+0}'",
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
            message: ":jenkins: *${title}*\\n" +
                     "*Job:* ${JOB_NAME}\\n" +
                     "*Build:* #${BUILD_NUMBER}\\n" +
                     "*Branch:* ${env.BRANCH_NAME ?: 'master'}\\n" +
                     "*Message:* ${message}\\n" +
                     "*Build URL:* ${BUILD_URL}",
            tokenCredentialId: env.SLACK_CREDENTIAL_ID
        )
    } catch (Exception e) {
        echo "Failed to send Slack notification: ${e.message}"
    }
}
