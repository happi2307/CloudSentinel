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
  description = "CIDR block allowed to SSH into the Jenkins host."
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

resource "aws_security_group" "jenkins" {
  name        = "cloudsentinel-jenkins-sg"
  description = "Security group for Jenkins controller access"
  vpc_id      = data.aws_vpc.default.id

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ssh_cidr]
  }

  ingress {
    description = "Jenkins UI"
    from_port   = var.jenkins_port
    to_port     = var.jenkins_port
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "cloudsentinel-jenkins-sg"
  }
}

resource "aws_instance" "jenkins" {
  ami                         = data.aws_ami.ubuntu.id
  instance_type               = var.instance_type
  key_name                    = var.key_pair_name
  subnet_id                   = data.aws_subnets.default.ids[0]
  vpc_security_group_ids      = [aws_security_group.jenkins.id]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = var.root_volume_size
    volume_type           = "gp3"
    delete_on_termination = true
  }

  user_data = <<-EOF
              #!/bin/bash
              set -eux

              apt-get update
              apt-get install -y fontconfig openjdk-17-jre docker.io curl gnupg ca-certificates

              install -m 0755 -d /etc/apt/keyrings
              curl -fsSL https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key | tee /etc/apt/keyrings/jenkins-keyring.asc >/dev/null
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

output "jenkins_public_ip" {
  description = "Public IP of the Jenkins EC2 instance."
  value       = aws_instance.jenkins.public_ip
}

output "jenkins_url" {
  description = "Jenkins UI URL."
  value       = "http://${aws_instance.jenkins.public_ip}:${var.jenkins_port}"
}
