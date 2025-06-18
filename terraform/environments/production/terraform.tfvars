# Production environment configuration
aws_region   = "us-west-2"
environment  = "production"

# VPC Configuration
vpc_cidr = "10.0.0.0/16"
private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

# EKS Configuration
kubernetes_version = "1.28"
eks_node_groups = {
  main = {
    instance_types = ["t3.medium"]
    scaling_config = {
      desired_size = 3
      max_size     = 6
      min_size     = 2
    }
    update_config = {
      max_unavailable = 1
    }
    capacity_type = "ON_DEMAND"
    disk_size     = 50
  }
  spot = {
    instance_types = ["t3.medium", "t3a.medium", "t2.medium"]
    scaling_config = {
      desired_size = 2
      max_size     = 4
      min_size     = 0
    }
    update_config = {
      max_unavailable = 1
    }
    capacity_type = "SPOT"
    disk_size     = 50
  }
}

# Jenkins Configuration
jenkins_instance_type = "t3.large"
key_pair_name        = "islamic-app-key"

# RDS Configuration
postgres_version     = "15.4"
rds_instance_class   = "db.t3.small"
database_name        = "islamic_app"
database_username    = "islamic_user"
backup_retention_period = 14
backup_window          = "03:00-04:00"
maintenance_window     = "sun:04:00-sun:05:00"
