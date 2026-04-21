# CloudSentinel

CloudSentinel is a sample DevSecOps project that demonstrates how Terraform, Ansible, Jenkins, Docker, and AWS EC2 can work together in one delivery flow.

The project now shows these responsibilities clearly:
- Terraform provisions the AWS infrastructure for a Jenkins-ready EC2 instance
- Ansible configures the EC2 host with Jenkins, Docker, and deployment automation
- Jenkins runs the CI/CD pipeline for build, security scan, image push, and release

The pipeline performs these actions:
- checks out source code
- scans the repository with Checkov
- installs application dependencies in a containerized Node.js runtime
- builds and pushes a Docker image
- deploys the latest container to an EC2 instance

The repository is set up to keep secrets out of source control and use Jenkins credentials for deployment.
