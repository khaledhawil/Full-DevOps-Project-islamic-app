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
            name: 'TEST_INFRASTRUCTURE',
            defaultValue: false,
            description: 'Test infrastructure changes by building both components'
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
                    
                    sendDetailedSlackNotification(
                        "Pipeline Started", 
                        "STARTED",
                        "*Started by:* ${env.BUILD_USER ?: 'SCM Change'}\n*Commit:* ${env.GIT_COMMIT_SHORT}",
                        ":rocket:"
                    )
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
                    
                    // Override detection if testing infrastructure
                    if (params.TEST_INFRASTRUCTURE) {
                        echo "🔧 TEST_INFRASTRUCTURE parameter enabled - building both components"
                        changes.frontend = true
                        changes.backend = true
                    }
                    
                    env.BUILD_FRONTEND = changes.frontend.toString()
                    env.BUILD_BACKEND = changes.backend.toString()
                    
                    echo "🔍 Change Detection Results:"
                    echo "Frontend changes: ${env.BUILD_FRONTEND}"
                    echo "Backend changes: ${env.BUILD_BACKEND}"
                    
                    if (!changes.frontend && !changes.backend) {
                        echo "✅ No application code changes detected. Skipping builds."
                        sendDetailedSlackNotification(
                            "Change Detection Complete", 
                            "SUCCESS",
                            ":mag: *No application changes detected*\n:fast_forward: Build will be skipped\n:white_check_mark: Pipeline completed without building",
                            ":white_check_mark:"
                        )
                        
                        env.BUILD_FRONTEND = 'false'
                        env.BUILD_BACKEND = 'false'
                        env.SKIP_BUILD = 'true'
                        
                        echo "🎯 Pipeline will skip build stages and proceed to cleanup"
                    } else {
                        env.SKIP_BUILD = 'false'
                        
                        def buildMessage = []
                        if (changes.frontend) buildMessage.add("Frontend")
                        if (changes.backend) buildMessage.add("Backend")
                        
                        def buildComponents = buildMessage.join(' and ')
                        sendDetailedSlackNotification(
                            "Change Detection Complete", 
                            "SUCCESS",
                            ":mag: *Changes detected in:* ${buildComponents}\n:building_construction: Proceeding with build...",
                            ":arrows_counterclockwise:"
                        )
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
                        case 'auto':
                            // Keep existing values from change detection
                            // But override if TEST_INFRASTRUCTURE is enabled
                            if (params.TEST_INFRASTRUCTURE) {
                                env.BUILD_FRONTEND = 'true'
                                env.BUILD_BACKEND = 'true'
                                echo "🔧 TEST_INFRASTRUCTURE enabled - overriding to build both"
                            }
                            break
                    }
                    
                    echo "📋 Build Configuration:"
                    echo "Build Frontend: ${env.BUILD_FRONTEND}"
                    echo "Build Backend: ${env.BUILD_BACKEND}"
                    echo "Force Build: ${params.FORCE_BUILD}"
                    echo "Test Infrastructure: ${params.TEST_INFRASTRUCTURE}"
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
                                        sendDetailedSlackNotification(
                                            "SonarQube Analysis", 
                                            "WARNING",
                                            ":warning: *Quality Gate Status:* ${qg.status}\n:chart_with_downwards_trend: Code quality issues detected\n:link: *SonarQube Dashboard:* ${SONAR_HOST_URL}/dashboard?id=islamic-app",
                                            ":chart_with_upwards_trend:"
                                        )
                                    } else {
                                        echo "✅ SonarQube Quality Gate: PASSED"
                                        sendDetailedSlackNotification(
                                            "SonarQube Analysis Completed", 
                                            "PASSED",
                                            ":white_check_mark: *Quality Gate:* PASSED\n:chart_with_upwards_trend: Code quality standards met\n:link: *SonarQube Dashboard:* ${SONAR_HOST_URL}/dashboard?id=islamic-app",
                                            ":chart_with_upwards_trend:"
                                        )
                                    }
                                }
                            } catch (Exception e) {
                                echo "⚠️ SonarQube Quality Gate check failed or plugin not available: ${e.message}"
                                sendDetailedSlackNotification(
                                    "SonarQube Analysis Completed", 
                                    "SUCCESS",
                                    ":information_source: Analysis completed successfully\n:warning: Quality Gate plugin may not be available\n:link: *SonarQube Dashboard:* ${SONAR_HOST_URL}/dashboard?id=islamic-app",
                                    ":chart_with_upwards_trend:"
                                )
                            }
                        }
                        
                    } catch (Exception e) {
                        echo "⚠️ SonarQube analysis failed: ${e.message}"
                        sendDetailedSlackNotification(
                            "SonarQube Analysis Failed", 
                            "FAILED",
                            ":x: *Error:* ${e.message}\n:warning: Code quality analysis could not be completed",
                            ":chart_with_downwards_trend:"
                        )
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
                            
                            sendDetailedSlackNotification(
                                "Frontend Build Completed", 
                                "SUCCESS",
                                ":art: *Frontend Image:* ${env.FRONTEND_IMAGE}:${env.BUILD_TAG}\n:docker: Build completed successfully",
                                ":art:"
                            )
                        }
                    } catch (Exception e) {
                        sendDetailedSlackNotification(
                            "Frontend Build Failed", 
                            "FAILED",
                            ":x: *Error:* ${e.message}\n:warning: Frontend build could not be completed",
                            ":art:"
                        )
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
                            
                            sendDetailedSlackNotification(
                                "Backend Build Completed", 
                                "SUCCESS",
                                ":gear: *Backend Image:* ${env.BACKEND_IMAGE}:${env.BUILD_TAG}\n:docker: Build completed successfully",
                                ":gear:"
                            )
                        }
                    } catch (Exception e) {
                        sendDetailedSlackNotification(
                            "Backend Build Failed", 
                            "FAILED",
                            ":x: *Error:* ${e.message}\n:warning: Backend build could not be completed",
                            ":gear:"
                        )
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
                        def message = ":shield: *Security Scan Completed* :white_check_mark:\n" +
                                     "*Job:* ${JOB_NAME}\n" +
                                     "*Build:* #${BUILD_NUMBER}\n" +
                                     "*Branch:* ${env.BRANCH_NAME ?: 'master'}\n" +
                                     "*Status:* SUCCESS :white_check_mark:\n" +
                                     ":shield: *Security Summary:*\n"
                        
                        if (env.BUILD_FRONTEND == 'true') {
                            message += ":art: *Frontend scan:* :white_check_mark: Completed\n"
                        }
                        if (env.BUILD_BACKEND == 'true') {
                            message += ":gear: *Backend scan:* :white_check_mark: Completed\n"
                        }
                        
                        message += ":link: *Full Reports:* ${BUILD_URL}artifact/security-reports/\n*Build URL:* ${BUILD_URL}"
                        
                        sendSlackNotification("Security Scan Completed", message, "good")
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
                            
                            sendDetailedSlackNotification(
                                "Docker Image Pushed Successfully", 
                                "SUCCESS",
                                ":docker: *Frontend Image:* ${env.FRONTEND_IMAGE}:${env.BUILD_TAG}\n" +
                                ":arrow_up: *Registry:* Docker Hub\n" +
                                ":white_check_mark: Push completed successfully",
                                ":docker:"
                            )
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
                            
                            sendDetailedSlackNotification(
                                "Docker Image Pushed Successfully", 
                                "SUCCESS",
                                ":docker: *Backend Image:* ${env.BACKEND_IMAGE}:${env.BUILD_TAG}\n" +
                                ":arrow_up: *Registry:* Docker Hub\n" +
                                ":white_check_mark: Push completed successfully",
                                ":docker:"
                            )
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
                        
                        sendDetailedSlackNotification(
                            "Deployment Update Completed", 
                            "SUCCESS",
                            ":kubernetes: *Kubernetes manifests updated*\n" +
                            ":rocket: *Image tags updated to:* ${env.BUILD_TAG}\n" +
                            ":white_check_mark: Changes pushed to repository",
                            ":kubernetes:"
                        )
                    } catch (Exception e) {
                        sendDetailedSlackNotification(
                            "Deployment Update Failed", 
                            "FAILED",
                            ":x: *Issue:* Could not update Kubernetes deployment manifest\n" +
                            ":warning: *Error:* ${e.message}",
                            ":kubernetes:"
                        )
                        throw e
                    }
                }
            }
        }
    }
    
    post {
        success {
            script {
                def message = ":jenkins: *Pipeline Completed Successfully* :white_check_mark:\n" +
                             "*Job:* ${JOB_NAME}\n" +
                             "*Build:* #${BUILD_NUMBER}\n" +
                             "*Status:* SUCCESS :white_check_mark:\n" +
                             "*Duration:* ${currentBuild.durationString}\n"
                
                if (env.BUILD_FRONTEND == 'true') {
                    message += ":art: *Frontend:* ${FRONTEND_IMAGE}:${env.BUILD_TAG}\n"
                }
                if (env.BUILD_BACKEND == 'true') {
                    message += ":gear: *Backend:* ${BACKEND_IMAGE}:${env.BUILD_TAG}\n"
                }
                
                message += ":link: *Build Details:* ${env.BUILD_URL}\n" +
                          ":link: *Console:* ${env.BUILD_URL}console"
                
                sendSlackNotification("Pipeline Completed Successfully", message, "good")
            }
        }
        failure {
            script {
                def message = ":jenkins: *Pipeline Failed* :x:\n" +
                             "*Job:* ${JOB_NAME}\n" +
                             "*Build:* #${BUILD_NUMBER}\n" +
                             "*Status:* FAILED :x:\n" +
                             "*Duration:* ${currentBuild.durationString}\n" +
                             "*Failed Stage:* ${env.STAGE_NAME ?: 'Unknown'}\n" +
                             ":link: *Build Details:* ${env.BUILD_URL}\n" +
                             ":link: *Console:* ${env.BUILD_URL}console\n" +
                             ":warning: Please check the logs for more details"
                
                sendSlackNotification("Pipeline Failed", message, "danger")
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
        def changedFiles = []
        
        if (!lastCommit) {
            def recentChanges = sh(
                script: "git diff --name-only HEAD~1 HEAD 2>/dev/null || echo ''",
                returnStdout: true
            ).trim()
            
            if (!recentChanges) {
                echo "⚠️ No changes detected or first build, skipping all builds"
                return changes
            }
            
            changedFiles = recentChanges.split('\n')
        } else {
            def diffOutput = sh(
                script: "git diff --name-only ${lastCommit} HEAD",
                returnStdout: true
            ).trim()
            
            if (!diffOutput) {
                echo "✅ No changes detected since last successful build"
                return changes
            }
            
            changedFiles = diffOutput.split('\n')
        }
        
        echo "📁 Changed files: ${changedFiles.join(', ')}"
        
        changedFiles.each { file ->
            // Frontend specific changes
            if (file.startsWith('frontend/') || 
                file.startsWith('k8s/05-frontend.yaml') ||
                (file.contains('package.json') && file.startsWith('frontend/')) ||
                (file.contains('tsconfig.json') && file.startsWith('frontend/')) ||
                (file.contains('nginx.conf') && file.startsWith('frontend/')) ||
                file.endsWith('.tsx') ||
                file.endsWith('.ts') ||
                file.endsWith('.css') ||
                file.endsWith('.scss') ||
                (file.endsWith('.js') && file.startsWith('frontend/')) ||
                (file.endsWith('.jsx') && file.startsWith('frontend/'))) {
                echo "🎨 Frontend change detected: ${file}"
                changes.frontend = true
            }
            
            // Backend specific changes
            if (file.startsWith('backend/') || 
                file.startsWith('k8s/04-backend.yaml') ||
                file.startsWith('database/') ||
                (file.contains('requirements.txt') && file.startsWith('backend/')) ||
                (file.contains('app.py') && file.startsWith('backend/')) ||
                (file.contains('database.py') && file.startsWith('backend/')) ||
                (file.endsWith('.py') && (file.startsWith('backend/') || file.startsWith('database/')))) {
                echo "⚙️ Backend change detected: ${file}"
                changes.backend = true
            }
        }
        
        // Log the detection results
        if (!changes.frontend && !changes.backend) {
            echo "✅ No frontend or backend code changes detected"
            echo "📝 Changed files were: ${changedFiles.join(', ')}"
            echo "🚫 These files don't trigger application builds"
        }
        
    } catch (Exception e) {
        echo "⚠️ Error detecting changes: ${e.message}"
        echo "🔧 Defaulting to no builds due to detection error"
        // Don't default to building everything - be conservative
        changes.frontend = false
        changes.backend = false
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
            sendDetailedSlackNotification(
                "Trivy Security Scan Complete", 
                "WARNING",
                ":warning: *CRITICAL VULNERABILITIES FOUND*\n" +
                ":shield: *Image:* ${imageName}\n" +
                ":red_circle: *Critical/High Issues:* ${criticalVulns}\n" +
                ":exclamation: *IMMEDIATE ACTION REQUIRED*\n" +
                ":point_right: Review critical vulnerabilities before production deployment\n" +
                ":link: *Full Report:* ${BUILD_URL}artifact/security-reports/",
                ":shield:"
            )
        } else {
            echo "✅ No HIGH/CRITICAL vulnerabilities found in ${component}"
            sendDetailedSlackNotification(
                "Trivy Security Scan Complete", 
                "SUCCESS",
                ":shield: *Image:* ${imageName}\n" +
                ":white_check_mark: *Status:* NO CRITICAL VULNERABILITIES FOUND\n" +
                ":green_circle: Security scan passed\n" +
                ":link: *Full Report:* ${BUILD_URL}artifact/security-reports/",
                ":shield:"
            )
        }
        
    } catch (Exception e) {
        echo "⚠️ Security scan failed for ${component}: ${e.message}"
        sendDetailedSlackNotification(
            "Security Scan Failed", 
            "FAILED",
            ":x: *Error:* ${e.message}\n" +
            ":shield: *Component:* ${component}\n" +
            ":warning: Security scan could not be completed",
            ":shield:"
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
            message: message,
            tokenCredentialId: env.SLACK_CREDENTIAL_ID
        )
    } catch (Exception e) {
        echo "Failed to send Slack notification: ${e.message}"
    }
}

def sendDetailedSlackNotification(stage, status, details = "", emoji = ":jenkins:") {
    def statusEmoji = ""
    def statusColor = "good"
    
    switch(status.toUpperCase()) {
        case "SUCCESS":
        case "PASSED":
            statusEmoji = ":white_check_mark:"
            statusColor = "good"
            break
        case "FAILED":
        case "FAILURE":
            statusEmoji = ":x:"
            statusColor = "danger"
            break
        case "WARNING":
        case "UNSTABLE":
            statusEmoji = ":warning:"
            statusColor = "warning"
            break
        case "STARTED":
        case "RUNNING":
            statusEmoji = ":arrows_counterclockwise:"
            statusColor = "#36a64f"
            break
        default:
            statusEmoji = ":information_source:"
            statusColor = "good"
    }
    
    def message = "${emoji} *${stage}* ${statusEmoji}\n" +
                  "*Job:* ${JOB_NAME}\n" +
                  "*Build:* #${BUILD_NUMBER}\n" +
                  "*Branch:* ${env.BRANCH_NAME ?: 'master'}\n" +
                  "*Status:* ${status} ${statusEmoji}\n"
    
    if (details) {
        message += "${details}\n"
    }
    
    message += "*Build URL:* ${BUILD_URL}"
    
    sendSlackNotification(stage, message, statusColor)
}
