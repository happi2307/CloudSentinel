terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

variable "aws_region" {
  description = "AWS region for the Jenkins EC2 instance."
  type        = string
  default     = "ap-south-1"
}

variable "instance_type" {
  description = "EC2 instance type for Jenkins. t3.large gives 2 vCPU and 8 GiB RAM, which is a practical baseline for small-team Jenkins workloads."
  type        = string
  default     = "t3.large"
}

variable "key_pair_name" {
  description = "Existing AWS key pair name for SSH access."
  type        = string
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into the Jenkins host. Restrict this to trusted admin IPs."
  type        = string
  default     = "10.0.0.0/32"
}

variable "allowed_jenkins_cidr" {
  description = "CIDR block allowed to access the Jenkins UI."
  type        = string
  default     = "0.0.0.0/0"
}

variable "jenkins_port" {
  description = "Port exposed for the Jenkins UI."
  type        = number
  default     = 8080
}

variable "root_volume_size" {
  description = "Root EBS volume size in GiB."
  type        = number
  default     = 30
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

data "aws_ami" "ubuntu" {
  most_recent = true
  owners      = ["099720109477"]

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-amd64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

data "aws_iam_policy" "ssm_managed_instance_core" {
  arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_security_group" "jenkins" {
  name        = "cloudsentinel-jenkins-sg"
  description = "Security group for Jenkins controller access"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH from trusted admin network"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "Jenkins UI access"
    from_port   = var.jenkins_port
    to_port     = var.jenkins_port
    protocol    = "tcp"
    cidr_blocks = [var.allowed_jenkins_cidr]
  }

  egress {
    description = "HTTPS outbound"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "HTTP outbound"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "DNS TCP outbound"
    from_port   = 53
    to_port     = 53
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    description = "DNS UDP outbound"
    from_port   = 53
    to_port     = 53
    protocol    = "udp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cloudsentinel-jenkins-sg"
  }
}

resource "aws_iam_role" "jenkins" {
  name = "cloudsentinel-jenkins-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "ec2.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.jenkins.name
  policy_arn = data.aws_iam_policy.ssm_managed_instance_core.arn
}

resource "aws_iam_instance_profile" "jenkins" {
  name = "cloudsentinel-jenkins-instance-profile"
  role = aws_iam_role.jenkins.name
}

resource "aws_instance" "jenkins" {
  ami                    = data.aws_ami.ubuntu.id
  instance_type          = var.instance_type
  key_name               = var.key_pair_name
  subnet_id              = data.aws_subnets.default.ids[0]
  vpc_security_group_ids = [aws_security_group.jenkins.id]

  associate_public_ip_address = false
  ebs_optimized               = true
  monitoring                  = true
  iam_instance_profile        = aws_iam_instance_profile.jenkins.name

  metadata_options {
    http_endpoint = "enabled"
    http_tokens   = "required"
  }

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }

  user_data = <<-EOF
              #!/bin/bash
              set -eux

              apt-get update
              apt-get install -y fontconfig openjdk-21-jre docker.io curl ca-certificates

              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2026.key | tee /etc/apt/keyrings/jenkins-keyring.asc >/dev/null
              echo "deb [signed-by=/etc/apt/keyrings/jenkins-keyring.asc] https://pkg.jenkins.io/debian-stable binary/" > /etc/apt/sources.list.d/jenkins.list

              apt-get update
              apt-get install -y jenkins

              systemctl enable docker
              systemctl start docker
              systemctl enable jenkins
              systemctl start jenkins

              usermod -aG docker ubuntu
              usermod -aG docker jenkins
              systemctl restart jenkins
              EOF

  tags = {
    Name = "cloudsentinel-jenkins"
  }
}

resource "aws_eip" "jenkins" {
  domain = "vpc"

  tags = {
    Name = "cloudsentinel-jenkins-eip"
  }
}

resource "aws_eip_association" "jenkins" {
  instance_id   = aws_instance.jenkins.id
  allocation_id = aws_eip.jenkins.id
}

output "jenkins_public_ip" {
  description = "Public IP of the Jenkins EC2 instance."
  value       = aws_eip.jenkins.public_ip
}

output "jenkins_url" {
  description = "Jenkins UI URL."
  value       = "http://${aws_eip.jenkins.public_ip}:${var.jenkins_port}"
}
