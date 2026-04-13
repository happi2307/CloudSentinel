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

### Jenkins on EC2
- The Terraform file in [`terraform/main.tf`](/c:/Users/Akshat/Downloads/CloudSentinel/terraform/main.tf#L1) now provisions a Jenkins-ready Ubuntu EC2 instance with Docker, Java 17, and Jenkins installed automatically.
- The default instance type is `t3.large`, which is a more practical baseline for a small shared Jenkins controller than lightweight burstable instances.
- If you host Jenkins and the application on the same EC2 machine, do not leave both on port `8080`. Jenkins uses `8080` by default, so the application should move to another port or sit behind a reverse proxy.

### How to Use
1. Make changes inside `app/`.
2. Commit and push to `main`.
3. Trigger the Jenkins pipeline manually or through SCM polling/webhooks.
4. Monitor Jenkins console logs for each stage.
5. Access the deployed app at `http://<EC2-PUBLIC-IP>:8080`.

### Dashboard with Real Jenkins Data
The web dashboard can now show live Jenkins data (latest stage timeline + real build history) and trigger actual builds through Jenkins API.

1. Create Jenkins API token
   - Open Jenkins > your user > Configure > API Token
   - Generate a token and copy it once

2. Configure app environment
   - Copy `app/.env.example` values into your runtime environment
   - Required variables:
     - `JENKINS_BASE_URL` (example: `http://43.205.130.141:8080`)
     - `JENKINS_JOB_NAME` (job name or folder path like `team/cloudsentinel-pipeline`)
     - `JENKINS_USERNAME`
     - `JENKINS_API_TOKEN`

3. Start the app from repository root

   ```bash
   node app/index.js
   ```

4. Open dashboard
   - `http://127.0.0.1:8081`
   - Use **Trigger Jenkins Build** to start an actual Jenkins run
   - Build history and latest pipeline stages are fetched live from Jenkins

Notes:
- If Jenkins is not configured, the dashboard shows a configuration message.
- Stage breakdown uses Jenkins Pipeline `wfapi` endpoint when available.

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
