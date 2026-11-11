# CloudSentinel Architecture

CloudSentinel uses one Ubuntu EC2 instance for Jenkins and the application. Terraform is applied manually by an operator; each Jenkins run scans the repository, builds and publishes an image, then invokes Ansible locally on that host.

## System Architecture

```mermaid
flowchart TB
    repo["GitHub repository<br/>Application, pipeline, and infrastructure code"]
    tf["Terraform<br/>Manual plan and apply"]
    hub["Docker Hub<br/>Application image"]
    browser["Browser"]

    subgraph aws["AWS: default VPC"]
        infra["Elastic IP and security group<br/>IAM instance profile and encrypted EBS"]
        subgraph host["Ubuntu EC2: shared Jenkins and application host"]
            jenkins["Jenkins :8080<br/>Checkov scan and Docker build"]
            ansible["Ansible<br/>Local deployment with sudo"]
            app["Node.js / Express container<br/>Host 8081 to container 8080"]
            jenkins -->|Invoke deployment playbook| ansible
            ansible -->|Replace application container| app
        end
        infra -.->|Instance configuration| host
    end

    tf -.->|Provision resources and bootstrap host| aws
    repo -->|Configured webhook and checkout| jenkins
    jenkins -->|Push image after scan and build| hub
    hub -->|Pull image| ansible
    browser -->|HTTP on host port 8081| app

    classDef provision fill:#fff4db,stroke:#b7791f,color:#422006
    classDef automation fill:#e8f1fb,stroke:#28649d,color:#16324f
    classDef runtime fill:#e7f5ed,stroke:#2e7d54,color:#153e29
    class tf,infra provision
    class jenkins,repo,hub automation
    class ansible,app runtime
```

Solid arrows show workflow or traffic. Dotted arrows show provisioning and infrastructure relationships. Checkov failing stops subsequent build and deployment stages.

## Deployment Sequence

```mermaid
sequenceDiagram
    actor Operator
    participant TF as Terraform
    participant Host as EC2 host
    participant GitHub
    participant Jenkins
    participant Checkov
    participant Hub as Docker Hub
    participant Ansible

    Operator->>TF: Review plan and apply manually
    TF->>Host: Provision EC2, SG, IAM, EBS, and EIP
    Note over Host: Bootstrap installs<br/>Java, Docker, Jenkins
    Note over Operator,Host: Configure permissions and credentials<br/>Complete Jenkins job and webhook setup
    GitHub->>Jenkins: Push webhook, if configured
    Jenkins->>GitHub: Checkout source
    Jenkins->>Checkov: Scan Terraform, Ansible, and Dockerfile
    alt Scan fails
        Checkov-->>Jenkins: Nonzero exit code
        Note over Jenkins: Build fails<br/>Skip later stages
    else Scan passes
        Checkov-->>Jenkins: Exit code 0
        Jenkins->>Host: Install app dependencies and build Docker image
        Jenkins->>Hub: Authenticate and push image
        Jenkins->>Ansible: Invoke playbook with localhost inventory
        Ansible->>Host: Ensure Docker is installed and running
        Ansible->>Hub: Pull application image
        Ansible->>Host: Remove old/conflicting containers and run 8081:8080
        Ansible-->>Jenkins: Playbook result
        Note over Host,Jenkins: Browser and container health checks<br/>are performed manually
    end
```

## Implementation Notes

- Terraform is outside the Jenkins release pipeline. Its user-data script provides the initial Jenkins/Docker bootstrap; `configure-jenkins.yml` is a separate manual configuration option.
- Jenkins and Ansible deployment execute on the same Linux node. No SSH credential is used by the current pipeline; the old EC2 IP/user environment variables are unused.
- The security group currently defines SSH and Jenkins ingress only. Public application access needs an additional TCP `8081` rule.
- An Elastic IP makes the host public; disabling automatic public IP assignment does not make it private.
- The application listens on container port `8080`, and Docker publishes it as host port `8081`. Jenkins remains on host port `8080`.
- The playbook replaces containers using Docker CLI commands. It does not implement rollback, zero-downtime deployment, or an application-health gate.

## Suggested Report Caption

**Figure X.** CloudSentinel architecture showing manually provisioned AWS infrastructure and a Jenkins release pipeline that validates configuration with Checkov, publishes a Docker image, and deploys the application through local Ansible execution on the EC2 host.

For installation commands and implementation screenshots, see the [README](README.md).
