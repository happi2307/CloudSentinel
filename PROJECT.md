# CloudSentinel

CloudSentinel is a sample DevSecOps project that demonstrates a Jenkins-driven CI/CD workflow for a Node.js application.

The pipeline performs these actions:
- checks out source code
- scans the repository with Checkov
- installs application dependencies
- builds and pushes a Docker image
- deploys the latest container to an EC2 instance

The repository is set up to keep secrets out of source control and use Jenkins credentials for deployment.
