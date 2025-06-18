# 🚀 Quick Reference: Terraform + Ansible Commands

## 📁 Project Structure Overview
```
📂 islamic-app/
├── 🏗️ terraform/          # Infrastructure (builds AWS resources)
│   ├── main.tf            # Master blueprint
│   ├── variables.tf       # Configuration options
│   ├── deploy.sh          # 🚀 One-click deployment
│   └── modules/           # Reusable components
└── 🤖 ansible/            # Configuration (sets up software)
    ├── site.yml           # Master plan
    ├── deploy.sh          # 🚀 One-click configuration
    └── roles/             # Different tasks
```

## 🎯 Quick Commands

### **Build Everything (Full Deployment)**
```bash
# 1. Build infrastructure
cd terraform/
./deploy.sh

# 2. Configure everything  
cd ../ansible/
./deploy.sh
```

### **Terraform Commands** 🏗️
```bash
# Initialize (first time only)
terraform init

# See what will be built
terraform plan

# Build everything
terraform apply

# Destroy everything (be careful!)
terraform destroy

# Show current state
terraform show

# Get outputs (IPs, URLs, etc.)
terraform output
```

### **Ansible Commands** 🤖
```bash
# Test connection to servers
ansible all -m ping

# Run specific role
ansible-playbook site.yml --tags docker

# Run on specific servers
ansible-playbook site.yml --limit jenkins

# Check what would change (dry run)
ansible-playbook site.yml --check

# Run with more details
ansible-playbook site.yml -v
```

## 🔧 File Purposes (Simple Explanation)

### **Terraform Files** 🏗️
| File | What It Does | Example |
|------|--------------|---------|
| `main.tf` | "Build these things in AWS" | Creates servers, databases |
| `variables.tf` | "Here are the options" | Server size, region, names |
| `outputs.tf` | "Show me this info after building" | IP addresses, URLs |
| `terraform.tfvars` | "Use these specific settings" | Production vs development |

### **Ansible Files** 🤖
| File | What It Does | Example |
|------|--------------|---------|
| `site.yml` | "Do these tasks on these servers" | Install Docker, configure Jenkins |
| `hosts.yml` | "Here are my servers" | IP addresses, connection info |
| `roles/*/tasks/main.yml` | "Steps to do a specific job" | Install software, copy files |

## 🎛️ Key Settings to Change

### **For Different Environments** 🌍
```hcl
# In terraform/terraform.tfvars
environment = "development"     # or "production"
jenkins_instance_type = "t3.small"    # smaller for dev
rds_instance_class = "db.t3.micro"    # smaller database
```

### **For Different Regions** 🌎
```hcl
# In terraform/terraform.tfvars
aws_region = "us-east-1"       # or "eu-west-1", etc.
```

### **For Cost Optimization** 💰
```hcl
# Use spot instances (cheaper but can be terminated)
eks_node_groups = {
  spot = {
    capacity_type = "SPOT"
    instance_types = ["t3.medium", "t3a.medium"]
  }
}
```

## 🚨 Common Issues & Solutions

### **"Permission Denied"** 🔐
```bash
# Fix SSH key permissions
chmod 400 ~/.ssh/islamic-app-key.pem

# Fix script permissions  
chmod +x deploy.sh
```

### **"Resource Already Exists"** ⚠️
```bash
# Import existing resource
terraform import aws_instance.jenkins i-1234567890abcdef0

# Or force recreate
terraform destroy
terraform apply
```

### **"Cannot Connect to Server"** 🔌
```bash
# Check security groups allow SSH (port 22)
# Check if server is running
# Verify correct IP address
```

## 📊 Monitoring & Access Points

### **After Deployment, Access These:** 🌐
```bash
# Get access URLs
terraform output

# Jenkins: http://JENKINS_IP:8080
# ArgoCD: kubectl get svc -n argocd  
# Grafana: kubectl get svc -n monitoring
```

### **Get Important Passwords** 🔑
```bash
# Jenkins password
ssh -i ~/.ssh/islamic-app-key.pem ec2-user@JENKINS_IP
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword

# ArgoCD password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Database password
aws secretsmanager get-secret-value --secret-id SECRET_ARN
```

## 🎯 Understanding the Flow

```
1. TERRAFORM 🏗️
   ┌─────────────────┐
   │ Read .tf files  │
   │ Plan resources  │ 
   │ Create in AWS   │
   │ Save outputs    │
   └─────────────────┘
            ↓
2. ANSIBLE 🤖  
   ┌─────────────────┐
   │ Read outputs    │
   │ Connect to VMs  │
   │ Install software│
   │ Configure apps  │
   └─────────────────┘
            ↓
3. RESULT ✅
   ┌─────────────────┐
   │ Working Islamic │
   │ App with full   │
   │ CI/CD pipeline  │
   └─────────────────┘
```

## 💡 Pro Tips

### **Development Workflow** 🔄
1. Make changes to `.tf` or `.yml` files
2. Test with `terraform plan` or `ansible-playbook --check`
3. Apply changes with `terraform apply` or `ansible-playbook`
4. Monitor results in CloudWatch/Grafana

### **Backup Strategy** 💾
- Terraform state is in S3 (automatically backed up)
- Database has automated backups (14 days)
- Jenkins data is in persistent volumes
- All code is in Git

### **Security Best Practices** 🔒
- Never put passwords in `.tf` files
- Use AWS Secrets Manager for sensitive data
- Rotate SSH keys regularly
- Monitor access logs in CloudWatch

## 🎓 Next Steps to Learn

1. **Terraform**: Study modules in `modules/` folder
2. **Ansible**: Look at roles in `roles/` folder  
3. **Kubernetes**: Explore `k8s/` manifests
4. **AWS**: Learn about VPC, EKS, RDS services
5. **Monitoring**: Study CloudWatch and Grafana dashboards

---

**Remember**: Infrastructure as Code = Everything in files = Version controlled = Reproducible! 🎯
