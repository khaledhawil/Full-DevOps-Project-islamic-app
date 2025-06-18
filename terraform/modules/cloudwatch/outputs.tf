output "dashboard_url" {
  description = "URL of the CloudWatch dashboard"
  value       = "https://${data.aws_region.current.name}.console.aws.amazon.com/cloudwatch/home?region=${data.aws_region.current.name}#dashboards:name=${aws_cloudwatch_dashboard.main.dashboard_name}"
}

output "sns_topic_arn" {
  description = "ARN of the SNS topic for alerts"
  value       = aws_sns_topic.alerts.arn
}

output "jenkins_log_group_name" {
  description = "Name of the Jenkins CloudWatch log group"
  value       = aws_cloudwatch_log_group.jenkins.name
}

output "eks_log_group_name" {
  description = "Name of the EKS CloudWatch log group"
  value       = aws_cloudwatch_log_group.eks_cluster.name
}
