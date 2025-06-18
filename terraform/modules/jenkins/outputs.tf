output "instance_id" {
  description = "ID of the Jenkins instance"
  value       = aws_instance.jenkins.id
}

output "instance_arn" {
  description = "ARN of the Jenkins instance"
  value       = aws_instance.jenkins.arn
}

output "public_ip" {
  description = "Public IP address assigned to the Jenkins instance"
  value       = aws_eip.jenkins.public_ip
}

output "private_ip" {
  description = "Private IP address assigned to the Jenkins instance"
  value       = aws_instance.jenkins.private_ip
}

output "jenkins_url" {
  description = "Jenkins URL"
  value       = "http://${aws_eip.jenkins.public_ip}:8080"
}

output "security_group_id" {
  description = "ID of the security group"
  value       = aws_security_group.jenkins.id
}

output "iam_role_arn" {
  description = "ARN of the Jenkins IAM role"
  value       = aws_iam_role.jenkins.arn
}
