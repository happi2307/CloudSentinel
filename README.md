# CloudSentinel - DevSecOps CI/CD Pipeline

CloudSentinel demonstrates a practical DevSecOps workflow for deploying a Dockerized Node.js web app to AWS EC2.

The project uses:
- Terraform to provision AWS infrastructure
- Checkov to scan infrastructure and container configuration
- Jenkins to automate CI/CD
- Docker to package the application
- Ansible to deploy the container to EC2

## Architecture

```text
GitHub push
  -> Jenkins pipeline
  -> Checkov security scan
  -> Docker build and push
  -> Ansible deploy
  -> EC2 app container
```

Terraform is intentionally run manually for this project so AWS infrastructure changes are controlled. Jenkins validates the Terraform code with Checkov on every run, then uses Ansible for repeatable deployment.

## Project Structure

```text
CloudSentinel/
|-- app/                 # Node.js application
|-- ansible/             # Ansible configuration and deployment playbooks
|-- terraform/           # AWS infrastructure as code
|-- Dockerfile           # App container image
|-- Jenkinsfile          # CI/CD pipeline
|-- PROJECT.md           # Short project summary
|-- README.md
```

## Terraform Usage

Terraform provisions the AWS resources used by the project, including the EC2 host, security group, IAM profile, and Elastic IP.

Run Terraform from your local machine:

```powershell
cd C:\Users\Akshat\Downloads\CloudSentinel\terraform
terraform init
terraform plan -var "key_pair_name=cloud" -var "allowed_ssh_cidr=YOUR_PUBLIC_IP/32"
terraform apply -var "key_pair_name=cloud" -var "allowed_ssh_cidr=YOUR_PUBLIC_IP/32"
```

Use the Terraform output `jenkins_public_ip` as the Jenkins and app host IP.

## Ansible Usage

Ansible configures and deploys the application container.

Manual deployment example:

```bash
cd ansible
cp inventory.ini.example inventory.ini
ansible-playbook configure-jenkins.yml
ansible-playbook deploy-app.yml
```

In Jenkins, the inventory is generated dynamically from Jenkins credentials, so the real `ansible/inventory.ini` file is not committed.

## Jenkins Pipeline

The Jenkins pipeline performs:

1. Checkout Code
2. Security Scan with Checkov
3. Build App dependencies using a Node Docker image
4. Docker Build
5. Docker Push to Docker Hub
6. Ansible Deploy to EC2

Required Jenkins credentials:
- `docker-creds`: Docker Hub username and password/token
- `ec2-ssh`: SSH private key for the EC2 host, username `ubuntu`

Required tools on the Jenkins EC2 host:
- Docker
- Git
- Ansible
- OpenSSH client

Install Ansible on the Jenkins host:

```bash
sudo apt update
sudo apt install -y ansible
```

## Ports

If Jenkins and the app run on the same EC2 instance:
- Jenkins UI: `http://<EC2_PUBLIC_IP>:8080`
- App: `http://<EC2_PUBLIC_IP>:8081`

The app listens on container port `8080`, and Ansible publishes it to host port `8081`.

## GitHub Webhook

To trigger Jenkins automatically on push:

1. In Jenkins job configuration, enable `GitHub hook trigger for GITScm polling`.
2. In GitHub repository settings, add a webhook:

```text
http://<EC2_PUBLIC_IP>:8080/github-webhook/
```

Set content type to `application/json` and choose push events.

## Security Notes

- Do not commit `.pem` files or credentials.
- Store Docker Hub and SSH credentials in Jenkins Credentials Manager.
- Restrict SSH ingress to your own IP when possible.
- Use Checkov to catch insecure Terraform and Docker configuration before deployment.
- Rotate any private key that was exposed outside your machine.
