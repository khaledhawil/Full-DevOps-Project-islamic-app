variable "name" {
  description = "Name to be used on all the resources as identifier"
  type        = string
}

variable "vpc_id" {
  description = "ID of the VPC where to create security group"
  type        = string
}

variable "subnet_id" {
  description = "ID of the subnet where to create the Jenkins instance"
  type        = string
}

variable "instance_type" {
  description = "Type of instance to start"
  type        = string
  default     = "t3.medium"
}

variable "key_name" {
  description = "Key name of the Key Pair to use for the instance"
  type        = string
}

variable "rds_endpoint" {
  description = "RDS endpoint for database connection"
  type        = string
  default     = ""
}

variable "eks_cluster_name" {
  description = "Name of the EKS cluster"
  type        = string
}

variable "tags" {
  description = "A map of tags to add to all resources"
  type        = map(string)
  default     = {}
}
