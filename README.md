## CloudSentinel - DevSecOps CI/CD Pipeline

### Overview
CloudSentinel is an end-to-end DevSecOps CI/CD pipeline project that automates building, scanning, containerizing, and deploying a Node.js application to AWS EC2 using Jenkins.

### Tech Stack
- Node.js - Backend application
- Jenkins - CI/CD automation
- Docker - Containerization
- Docker Hub - Image registry
- AWS EC2 - Deployment server
- Checkov - Security scanning

### Key Features
- Automated CI/CD pipeline triggered from source control changes
- Shift-left security scanning with Checkov before build and deployment
- Docker-based packaging for consistent runtime behavior
- Continuous deployment to EC2 using Jenkins-managed SSH credentials
- Secure credential handling through Jenkins credentials instead of hardcoded secrets
- Clear stage-by-stage visibility in Jenkins logs

### Pipeline Stages
1. Checkout Code
   Pulls the latest code from source control.
2. Security Scan
   Runs `checkov -d .` across the repository.
3. Build Application
   Runs `npm install` inside `app/`.
4. Docker Build
   Builds `happi2307/devsecops-app`.
5. Docker Login
   Authenticates to Docker Hub using Jenkins credentials.
6. Docker Push
   Pushes the latest image to Docker Hub.
7. Deploy to EC2
   Pulls the latest image, replaces the running app container, and starts the new release on port `8080`.

### Project Structure
```text
CloudSentinel/
|-- app/                 # Node.js application
|-- terraform/           # Infrastructure-as-code folder
|-- Dockerfile           # Docker configuration
|-- Jenkinsfile          # CI/CD pipeline
|-- PROJECT.md           # Project summary
|-- .gitignore
|-- .dockerignore
|-- README.md
```

### Setup Instructions
1. Clone the repository

   ```bash
   git clone https://github.com/happi2307/CloudSentinel.git
   cd CloudSentinel
   ```

2. Set up Jenkins plugins
   - Pipeline
   - Git
   - Docker Pipeline
   - SSH Agent

3. Configure Jenkins credentials
   - Docker Hub credentials ID: `docker-creds`
   - SSH private key credentials ID: `ec2-ssh`
   - SSH username: `ubuntu`

4. Create a Jenkins pipeline job
   - Use Pipeline from SCM
   - Point to the GitHub repository
   - Use the `main` branch

5. Ensure required tools are installed on the Jenkins agent
   - Docker
   - Node.js and npm
   - Checkov
   - OpenSSH client

### How to Use
1. Make changes inside `app/`.
2. Commit and push to `main`.
3. Trigger the Jenkins pipeline manually or through SCM polling/webhooks.
4. Monitor Jenkins console logs for each stage.
5. Access the deployed app at `http://<EC2-PUBLIC-IP>:8080`.

### Best Practices
- Do not commit `.pem` files or other secrets
- Do not hardcode credentials in the repository
- Use Jenkins Credentials Manager for Docker and SSH secrets
- Keep secret and local runtime files ignored in Git

### Future Improvements
- Add automated application tests
- Add monitoring with Prometheus and Grafana
- Expand deployment to Kubernetes or EKS
- Add pipeline notifications
