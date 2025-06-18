terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    kubernetes = {
      source  = "hashicorp/kubernetes"
      version = "~> 2.20"
    }
    helm = {
      source  = "hashicorp/helm"
      version = "~> 2.10"
    }
  }

  backend "s3" {
    bucket         = "islamic-app-terraform-state"
    key            = "infrastructure/terraform.tfstate"
    region         = "us-west-2"
    dynamodb_table = "islamic-app-terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Islamic-App"
      Environment = var.environment
      ManagedBy   = "Terraform"
      Owner       = "khaled-hawil"
    }
  }
}

provider "kubernetes" {
  host                   = module.eks.cluster_endpoint
  cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

  exec {
    api_version = "client.authentication.k8s.io/v1beta1"
    command     = "aws"
    args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
  }
}

provider "helm" {
  kubernetes {
    host                   = module.eks.cluster_endpoint
    cluster_ca_certificate = base64decode(module.eks.cluster_certificate_authority_data)

    exec {
      api_version = "client.authentication.k8s.io/v1beta1"
      command     = "aws"
      args        = ["eks", "get-token", "--cluster-name", module.eks.cluster_name]
    }
  }
}

# Data sources
data "aws_availability_zones" "available" {
  filter {
    name   = "opt-in-status"
    values = ["opt-in-not-required"]
  }
}

data "aws_caller_identity" "current" {}

# Local values
locals {
  name     = "islamic-app-${var.environment}"
  region   = var.aws_region
  azs      = slice(data.aws_availability_zones.available.names, 0, 3)
  
  tags = {
    Project     = "Islamic-App"
    Environment = var.environment
    ManagedBy   = "Terraform"
  }
}

# VPC Module
module "vpc" {
  source = "./modules/vpc"

  name = local.name
  cidr = var.vpc_cidr

  azs             = local.azs
  private_subnets = var.private_subnets
  public_subnets  = var.public_subnets

  enable_nat_gateway = true
  enable_vpn_gateway = false
  enable_dns_hostnames = true
  enable_dns_support = true

  tags = local.tags
}

# EKS Module
module "eks" {
  source = "./modules/eks"

  cluster_name    = "${local.name}-eks"
  cluster_version = var.kubernetes_version

  vpc_id          = module.vpc.vpc_id
  subnet_ids      = module.vpc.private_subnets
  control_plane_subnet_ids = module.vpc.private_subnets

  node_groups = var.eks_node_groups

  tags = local.tags
}

# Jenkins EC2 Module
module "jenkins" {
  source = "./modules/jenkins"

  name = "${local.name}-jenkins"
  
  vpc_id    = module.vpc.vpc_id
  subnet_id = module.vpc.public_subnets[0]
  
  instance_type = var.jenkins_instance_type
  key_name      = var.key_pair_name
  
  rds_endpoint = module.rds.endpoint
  eks_cluster_name = module.eks.cluster_name
  
  tags = local.tags
}

# RDS Module
module "rds" {
  source = "./modules/rds"

  identifier = "${local.name}-postgres"
  
  vpc_id     = module.vpc.vpc_id
  subnet_ids = module.vpc.private_subnets
  
  engine_version = var.postgres_version
  instance_class = var.rds_instance_class
  
  database_name = var.database_name
  username      = var.database_username
  password      = var.database_password
  
  backup_retention_period = var.backup_retention_period
  backup_window          = var.backup_window
  maintenance_window     = var.maintenance_window
  
  tags = local.tags
}

# CloudWatch Module for Jenkins
module "cloudwatch" {
  source = "./modules/cloudwatch"

  jenkins_instance_id = module.jenkins.instance_id
  cluster_name       = module.eks.cluster_name
  
  tags = local.tags
}
