---
all:
  children:
    jenkins:
      hosts:
        jenkins-server:
          ansible_host: ${jenkins_ip}
          ansible_user: ec2-user
          ansible_ssh_private_key_file: ~/.ssh/islamic-app-key.pem
          ansible_ssh_common_args: '-o StrictHostKeyChecking=no'
          private_ip: ${jenkins_private_ip}
          instance_role: jenkins
    
    eks:
      hosts:
        eks-cluster:
          cluster_name: ${eks_cluster_name}
          aws_region: ${aws_region}
          environment: ${environment}
          
  vars:
    ansible_python_interpreter: /usr/bin/python3
    aws_region: ${aws_region}
    environment: ${environment}
    eks_cluster_name: ${eks_cluster_name}
