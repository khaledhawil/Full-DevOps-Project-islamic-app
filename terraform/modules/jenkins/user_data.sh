#!/bin/bash

# Update system
yum update -y

# Install basic tools
yum install -y git curl wget unzip

# Create user for application
useradd -m -s /bin/bash appuser

# Create directory for ansible inventory
mkdir -p /opt/ansible
chown ec2-user:ec2-user /opt/ansible

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Configure AWS CLI region
aws configure set region ${aws_region}

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# Update EKS kubeconfig
aws eks update-kubeconfig --region ${aws_region} --name ${eks_cluster_name}

# Basic setup completed - Ansible will handle the rest
echo "Basic EC2 setup completed. Ready for Ansible configuration."
echo "EKS cluster: ${eks_cluster_name}"
# Configure AWS CLI region
aws configure set region ${aws_region}

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# Update EKS kubeconfig
aws eks update-kubeconfig --region ${aws_region} --name ${eks_cluster_name}

# Basic setup completed - Ansible will handle the rest
echo "Basic EC2 setup completed. Ready for Ansible configuration."
echo "EKS cluster: ${eks_cluster_name}"
