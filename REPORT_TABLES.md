# Report Tables for CloudSentinel

Use the following tables in the final report. They are compact enough to fit within the page limit and cover the most important technical aspects of the project.

## Table 1. Tool Stack and Role in the Project
**Suggested placement:** Chapter 1 or Chapter 3

| Tool / Technology | Role in CloudSentinel |
|---|---|
| GitHub | Stores source code, infrastructure files, and pipeline definitions |
| Jenkins | Automates the CI/CD workflow |
| Terraform | Provisions AWS infrastructure resources |
| Ansible | Configures the deployment environment and automates application release |
| Docker | Packages the application into a portable container image |
| Docker Hub | Stores and distributes the built application image |
| Checkov | Scans Terraform, Dockerfile, and Ansible configurations for security issues |
| AWS EC2 | Hosts Jenkins and the deployed web application |
| Node.js | Provides the runtime environment for the web application |

## Table 2. Project Inputs and Their Purpose
**Suggested placement:** Section 3.2 Input Features

| Input Component | Purpose |
|---|---|
| `app/` source code | Contains the Node.js application logic |
| `Dockerfile` | Defines how the application container image is built |
| `terraform/main.tf` | Defines AWS infrastructure resources |
| `ansible/deploy-app.yml` | Defines application deployment automation |
| `Jenkinsfile` | Defines CI/CD stages and orchestration logic |
| Jenkins credentials | Provide secure access to Docker Hub and deployment runtime configuration |

## Table 3. Manual Deployment vs Automated Deployment Comparison
**Suggested placement:** Section 5.2 Performance Comparison

| Parameter | Manual Deployment | Automated Deployment with CloudSentinel |
|---|---|---|
| Infrastructure setup | Performed manually in cloud console | Defined through Terraform |
| Server configuration | Performed manually through shell commands | Managed through Ansible |
| Build process | Executed manually | Automated in Jenkins |
| Deployment consistency | Depends on operator accuracy | Repeatable and standardized |
| Security validation | Often skipped or done late | Performed early through Checkov |
| Time required | Higher and variable | Lower and more predictable |
| Risk of configuration drift | High | Reduced significantly |

## Table 4. Security Validation Performed by Checkov
**Suggested placement:** Section 4.5 Security Validation using Checkov

| Scanned Component | Type of Validation |
|---|---|
| Terraform files | Infrastructure misconfigurations, IAM/network/storage security rules |
| Dockerfile | Container security best practices, user context, exposed ports, health checks |
| Ansible playbooks | Unsafe deployment or package-management configurations |

## Optional Table 5. Chapter-wise Page Budget
**Suggested placement:** Before the main body or in planning notes only

| Section | Suggested Length |
|---|---:|
| Abstract | 0.5 page |
| Chapter 1 Introduction | 2 to 2.5 pages |
| Chapter 2 Literature Su   rvey | 2.5 to 3 pages |
| Chapter 3 Framework Overview and Methodology | 4 to 5 pages |
| Chapter 4 Framework Implementation | 5 to 6 pages |
| Chapter 5 Experimental Results and Discussion | 3 to 4 pages |
| Chapter 6 Conclusion and Future Work | 1 to 1.5 pages |
| References | 1 to 2 pages |
| Appendix A Coding | Remaining space only if needed |

## Recommended Final Selection

If you want to keep the report concise, use these four tables in the final report:
- Table 1. Tool Stack and Role in the Project
- Table 2. Project Inputs and Their Purpose
- Table 3. Manual Deployment vs Automated Deployment Comparison
- Table 4. Security Validation Performed by Checkov
