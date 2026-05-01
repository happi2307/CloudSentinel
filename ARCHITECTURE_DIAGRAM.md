# CloudSentinel Architecture Diagram

## Mermaid Diagram

```mermaid
flowchart TD
    A[Developer / Team Member] -->|Push code| B[GitHub Repository]
    B -->|Webhook / SCM trigger| C[Jenkins Pipeline on AWS EC2]

    subgraph JenkinsHost[EC2 Instance]
        C --> D[Checkout Source Code]
        D --> E[Checkov Security Scan]
        E --> F[Build App Dependencies]
        F --> G[Docker Build]
        G --> H[Docker Push]
        H --> I[Ansible Local Deploy]
        I --> J[CloudSentinel App Container]
        C --> K[Jenkins UI :8080]
        J --> L[Web App :8081]
    end

    subgraph IaC[Infrastructure and Configuration Layer]
        M[Terraform] -->|Provision EC2 / SG / IAM / EIP| JenkinsHost
        N[Ansible Playbooks] -->|Configure host and deploy container| JenkinsHost
    end

    H -->|Push image| O[Docker Hub]
    O -->|Pull latest image| I

    E -->|Scans| P[Terraform Files]
    E -->|Scans| Q[Ansible Playbooks]
    E -->|Scans| R[Dockerfile]

    L -->|Accessible to user| S[Browser / End User]
```

## Diagram Notes

- GitHub stores the application source code, Jenkins pipeline, Terraform files, and Ansible playbooks.
- Jenkins acts as the CI/CD controller and runs on the EC2 instance.
- Checkov scans the infrastructure and deployment definitions before build and deployment continue.
- Docker packages the Node.js application and pushes the image to Docker Hub.
- Ansible performs the deployment on the same EC2 host using a local connection.
- Jenkins is available on port `8080`, while the deployed application is available on port `8081`.

## Suggested Figure Caption

**Figure X.** Architecture of the CloudSentinel DevSecOps pipeline showing GitHub integration, Jenkins orchestration, Terraform-based provisioning, Ansible-based deployment, Docker image flow, and the final application hosted on AWS EC2.
