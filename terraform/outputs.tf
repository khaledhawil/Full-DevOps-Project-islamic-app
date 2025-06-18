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
       aws ec2 create-key-pair --key-name islamic-app-key --query 'KeyMaterial' --output text > islamic-app-key.pem
       chmod 400 islamic-app-key.pem
    
    2. 🛠️ CONFIGURE KUBECTL:
       aws eks update-kubeconfig --region ${var.aws_region} --name ${module.eks.cluster_name}
    
    3. 🔐 GET JENKINS PASSWORD:
       ssh -i islamic-app-key.pem ec2-user@${module.jenkins.public_ip}
       sudo docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
    
    4. 🌐 ACCESS SERVICES:
       Jenkins: ${module.jenkins.jenkins_url}
       CloudWatch: ${module.cloudwatch.dashboard_url}
    
    5. 🗄️ DATABASE CONNECTION:
       Endpoint: ${module.rds.endpoint}
       Get credentials: aws secretsmanager get-secret-value --secret-id ${module.rds.secret_arn}
    
    6. ☸️ DEPLOY APPLICATIONS:
       cd ../k8s && ./deploy.sh
    
    7. 🔄 SETUP ARGOCD:
       cd ../argocd && ./deploy.sh
    
    💡 TIP: Save this output for reference!
    
  EOT
}
