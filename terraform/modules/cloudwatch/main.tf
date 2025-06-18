# CloudWatch Dashboard for Jenkins and EKS
resource "aws_cloudwatch_dashboard" "main" {
  dashboard_name = "Islamic-App-Infrastructure"

  dashboard_body = jsonencode({
    widgets = [
      {
        type   = "metric"
        x      = 0
        y      = 0
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/EC2", "CPUUtilization", "InstanceId", var.jenkins_instance_id],
            [".", "NetworkIn", ".", "."],
            [".", "NetworkOut", ".", "."],
            [".", "DiskReadOps", ".", "."],
            [".", "DiskWriteOps", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "Jenkins EC2 Metrics"
          period  = 300
        }
      },
      {
        type   = "metric"
        x      = 0
        y      = 6
        width  = 12
        height = 6

        properties = {
          metrics = [
            ["AWS/EKS", "cluster_failed_request_count", "ClusterName", var.cluster_name],
            [".", "cluster_node_count", ".", "."],
            [".", "cluster_ready_node_count", ".", "."]
          ]
          view    = "timeSeries"
          stacked = false
          region  = data.aws_region.current.name
          title   = "EKS Cluster Metrics"
          period  = 300
        }
      },
      {
        type   = "log"
        x      = 0
        y      = 12
        width  = 24
        height = 6

        properties = {
          query   = "SOURCE '/aws/ec2/jenkins'\n| fields @timestamp, @message\n| sort @timestamp desc\n| limit 100"
          region  = data.aws_region.current.name
          title   = "Jenkins Logs"
          view    = "table"
        }
      }
    ]
  })

  tags = var.tags
}

# CloudWatch Alarms for Jenkins EC2
resource "aws_cloudwatch_metric_alarm" "jenkins_cpu_high" {
  alarm_name          = "jenkins-cpu-utilization-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "CPUUtilization"
  namespace           = "AWS/EC2"
  period              = "300"
  statistic           = "Average"
  threshold           = "80"
  alarm_description   = "This metric monitors jenkins cpu utilization"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    InstanceId = var.jenkins_instance_id
  }

  tags = var.tags
}

resource "aws_cloudwatch_metric_alarm" "jenkins_status_check" {
  alarm_name          = "jenkins-status-check-failed"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "StatusCheckFailed"
  namespace           = "AWS/EC2"
  period              = "60"
  statistic           = "Maximum"
  threshold           = "0"
  alarm_description   = "This metric monitors jenkins status check"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    InstanceId = var.jenkins_instance_id
  }

  tags = var.tags
}

# CloudWatch Alarms for EKS
resource "aws_cloudwatch_metric_alarm" "eks_api_server_requests" {
  alarm_name          = "eks-api-server-requests-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "cluster_failed_request_count"
  namespace           = "AWS/EKS"
  period              = "300"
  statistic           = "Sum"
  threshold           = "10"
  alarm_description   = "This metric monitors EKS API server failed requests"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    ClusterName = var.cluster_name
  }

  tags = var.tags
}

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
  name = "islamic-app-infrastructure-alerts"

  tags = var.tags
}

# SNS Topic Subscription (Email)
resource "aws_sns_topic_subscription" "email_alerts" {
  count     = length(var.alert_email_addresses)
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email_addresses[count.index]
}

# CloudWatch Log Groups
resource "aws_cloudwatch_log_group" "jenkins" {
  name              = "/aws/ec2/jenkins"
  retention_in_days = 30

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "eks_cluster" {
  name              = "/aws/eks/${var.cluster_name}/cluster"
  retention_in_days = 30

  tags = var.tags
}

# Custom Metrics for Application Monitoring
resource "aws_cloudwatch_log_metric_filter" "jenkins_build_success" {
  name           = "jenkins-build-success"
  log_group_name = aws_cloudwatch_log_group.jenkins.name
  pattern        = "[timestamp, request_id, level=\"INFO\", message=\"Build Successful\"]"

  metric_transformation {
    name      = "JenkinsBuildSuccess"
    namespace = "Islamic-App/Jenkins"
    value     = "1"
  }
}

resource "aws_cloudwatch_log_metric_filter" "jenkins_build_failure" {
  name           = "jenkins-build-failure"
  log_group_name = aws_cloudwatch_log_group.jenkins.name
  pattern        = "[timestamp, request_id, level=\"ERROR\", message=\"Build Failed\"]"

  metric_transformation {
    name      = "JenkinsBuildFailure"
    namespace = "Islamic-App/Jenkins"
    value     = "1"
  }
}

# CloudWatch Composite Alarm
resource "aws_cloudwatch_composite_alarm" "infrastructure_health" {
  alarm_name        = "islamic-app-infrastructure-health"
  alarm_description = "Composite alarm for overall infrastructure health"
  
  alarm_rule = join(" OR ", [
    "ALARM(${aws_cloudwatch_metric_alarm.jenkins_cpu_high.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.jenkins_status_check.alarm_name})",
    "ALARM(${aws_cloudwatch_metric_alarm.eks_api_server_requests.alarm_name})"
  ])

  alarm_actions = [aws_sns_topic.alerts.arn]
  ok_actions    = [aws_sns_topic.alerts.arn]

  tags = var.tags
}

# Data source for current region
data "aws_region" "current" {}
