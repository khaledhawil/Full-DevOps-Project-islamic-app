output "vpc_id" {
  description = "ID of the VPC"
  value       = module.vpc.vpc_id
}

output "eks_cluster_name" {
  description = "Name of the EKS cluster"
  value       = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  description = "Endpoint for EKS control plane"
  value       = module.eks.cluster_endpoint
}

output "jenkins_url" {
  description = "Jenkins URL"
  value       = module.jenkins.jenkins_url
}

output "jenkins_public_ip" {
  description = "Jenkins public IP"
  value       = module.jenkins.public_ip
}

output "jenkins_private_ip" {
  description = "Jenkins private IP"
  value       = module.jenkins.private_ip
}

# ECR Repository URLs
output "ecr_backend_repository_url" {
  description = "ECR repository URL for backend"
  value       = aws_ecr_repository.islamic_app_backend.repository_url
}

output "ecr_frontend_repository_url" {
  description = "ECR repository URL for frontend"
  value       = aws_ecr_repository.islamic_app_frontend.repository_url
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.endpoint
}

output "cloudwatch_dashboard_url" {
  description = "CloudWatch dashboard URL"
  value       = module.cloudwatch.dashboard_url
}

output "database_secret_arn" {
  description = "ARN of the database secret in Secrets Manager"
  value       = module.rds.secret_arn
}

# Instructions for next steps
output "next_steps" {
  description = "Next steps after infrastructure deployment"
  value = <<-EOT
    
    🚀 INFRASTRUCTURE DEPLOYED SUCCESSFULLY! 🚀
    
    📋 NEXT STEPS:
    
    1. 🔑 CREATE AWS KEY PAIR:
       aws ec2 create-key-pair --key-name islamic-app-key --query 'KeyMaterial' --output text > ~/.ssh/islamic-app-key.pem
       chmod 400 ~/.ssh/islamic-app-key.pem
    
    2. 🛠️ CONFIGURE KUBECTL:
       aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}
    
    3. 🎯 RUN ANSIBLE PLAYBOOK:
       cd ../ansible
       ansible-playbook -i inventories/production/hosts.yml site.yml
    
    4. 🌐 ACCESS SERVICES:
       Jenkins: ${module.jenkins.jenkins_url}
       SonarQube: http://${module.jenkins.public_ip}:9000
       CloudWatch: ${module.cloudwatch.dashboard_url}
    
    5. 🔧 SETUP SONARQUBE INTEGRATION:
       Run: ./setup-sonarqube.sh
    
    📊 INFRASTRUCTURE DETAILS:
       - EKS Cluster: ${module.eks.cluster_name}
       - Jenkins IP: ${module.jenkins.public_ip}
       - ECR Backend: ${aws_ecr_repository.islamic_app_backend.repository_url}
       - ECR Frontend: ${aws_ecr_repository.islamic_app_frontend.repository_url}
    
    ✅ Ansible inventory has been generated automatically!
  EOT
}
