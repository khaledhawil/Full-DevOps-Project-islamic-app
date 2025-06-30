---
# Global variables for all hosts
aws_region: ${aws_region}
environment: ${environment}

# EKS Configuration
eks_cluster_name: ${eks_cluster_name}

# ECR Configuration
ecr_repositories:
  backend: ${ecr_backend_repo}
  frontend: ${ecr_frontend_repo}

# Jenkins Configuration
jenkins_instance_id: ${jenkins_instance_id}
jenkins_version: "lts"
jenkins_port: 8080

# Docker Configuration
docker_version: "latest"
docker_compose_version: "2.21.0"

# Trivy Configuration
trivy_version: "latest"

# SonarQube Configuration
sonarqube_version: "9.9-community"
sonarqube_port: 9000
sonarqube_admin_password: "Islamic@123"

# CloudWatch Agent Configuration
cloudwatch_namespace: "Islamic-App"
cloudwatch_log_group: "/aws/ec2/jenkins"

# ArgoCD Configuration
argocd_namespace: "argocd"
argocd_version: "5.46.8"  # Helm chart version
argocd_server_service_type: "LoadBalancer"

# Application Configuration
app_name: "islamic-app"
app_namespace: "islamic-app"
