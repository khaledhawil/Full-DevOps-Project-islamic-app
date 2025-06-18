#!/bin/bash

# Update system
yum update -y

# Install Docker
yum install -y docker
systemctl start docker
systemctl enable docker
usermod -a -G docker ec2-user

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Install AWS CLI v2
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
./aws/install

# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
chmod +x kubectl
mv kubectl /usr/local/bin/

# Install helm
curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Install Jenkins with Docker
mkdir -p /var/jenkins_home
chown 1000:1000 /var/jenkins_home

# Create Jenkins Docker Compose file
cat > /home/ec2-user/docker-compose.yml << 'EOF'
version: '3.8'
services:
  jenkins:
    image: jenkins/jenkins:lts
    container_name: jenkins
    restart: unless-stopped
    ports:
      - "8080:8080"
      - "50000:50000"
    volumes:
      - /var/jenkins_home:/var/jenkins_home
      - /var/run/docker.sock:/var/run/docker.sock
      - /usr/local/bin/docker:/usr/bin/docker
      - /usr/local/bin/docker-compose:/usr/bin/docker-compose
      - /usr/local/bin/kubectl:/usr/local/bin/kubectl
      - /usr/local/bin/helm:/usr/local/bin/helm
    environment:
      - JENKINS_OPTS=--httpPort=8080
      - JAVA_OPTS=-Xmx2048m -Xms1024m
    user: root
    privileged: true
EOF

# Start Jenkins
cd /home/ec2-user && docker-compose up -d

# Configure AWS CLI for Jenkins container
sleep 30
docker exec jenkins aws configure set region us-west-2

# Update EKS kubeconfig for Jenkins
docker exec jenkins aws eks update-kubeconfig --region us-west-2 --name ${eks_cluster_name}

# Install CloudWatch Agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

# Create CloudWatch Agent configuration
cat > /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json << 'EOF'
{
  "agent": {
    "metrics_collection_interval": 60,
    "run_as_user": "cwagent"
  },
  "metrics": {
    "namespace": "Islamic-App/Jenkins",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          "cpu_usage_idle",
          "cpu_usage_iowait",
          "cpu_usage_user",
          "cpu_usage_system"
        ],
        "metrics_collection_interval": 60,
        "totalcpu": false
      },
      "disk": {
        "measurement": [
          "used_percent"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "diskio": {
        "measurement": [
          "io_time"
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      },
      "mem": {
        "measurement": [
          "mem_used_percent"
        ],
        "metrics_collection_interval": 60
      },
      "netstat": {
        "measurement": [
          "tcp_established",
          "tcp_time_wait"
        ],
        "metrics_collection_interval": 60
      },
      "swap": {
        "measurement": [
          "swap_used_percent"
        ],
        "metrics_collection_interval": 60
      }
    }
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/jenkins_home/logs/jenkins.log",
            "log_group_name": "/aws/ec2/jenkins",
            "log_stream_name": "{instance_id}/jenkins.log"
          },
          {
            "file_path": "/var/log/messages",
            "log_group_name": "/aws/ec2/jenkins",
            "log_stream_name": "{instance_id}/messages"
          }
        ]
      }
    }
  }
}
EOF

# Start CloudWatch Agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
    -a fetch-config \
    -m ec2 \
    -c file:/opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json \
    -s

# Create a script to display Jenkins initial admin password
cat > /home/ec2-user/get-jenkins-password.sh << 'EOF'
#!/bin/bash
echo "=== Jenkins Initial Admin Password ==="
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
echo "======================================"
EOF

chmod +x /home/ec2-user/get-jenkins-password.sh

# Create environment file with database connection
cat > /home/ec2-user/.env << EOF
RDS_ENDPOINT=${rds_endpoint}
DATABASE_URL=postgresql://islamic_user:islamic_pass123@${rds_endpoint}:5432/islamic_app
EKS_CLUSTER_NAME=${eks_cluster_name}
EOF

# Wait for Jenkins to be ready and create initial admin user script
cat > /home/ec2-user/setup-jenkins.sh << 'EOF'
#!/bin/bash
# Wait for Jenkins to be fully ready
sleep 60

# Install required plugins
plugins=(
    "blueocean"
    "docker-workflow"
    "kubernetes"
    "pipeline-stage-view"
    "git"
    "workflow-aggregator"
    "pipeline-utility-steps"
    "discord-notifier"
    "github"
    "github-branch-source"
)

for plugin in "${plugins[@]}"; do
    docker exec jenkins java -jar /var/jenkins_home/war/WEB-INF/jenkins-cli.jar -s http://localhost:8080/ install-plugin $plugin
done

# Restart Jenkins to activate plugins
docker restart jenkins
EOF

chmod +x /home/ec2-user/setup-jenkins.sh

# Schedule Jenkins setup to run after reboot
echo "@reboot /home/ec2-user/setup-jenkins.sh" | crontab -u ec2-user -

echo "Jenkins installation completed!"
echo "Database endpoint: ${rds_endpoint}"
echo "EKS cluster: ${eks_cluster_name}"
