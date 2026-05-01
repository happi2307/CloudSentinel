# CloudSentinel Project Report Draft

## ABSTRACT

CloudSentinel is a DevSecOps-based project developed to demonstrate secure, automated, and repeatable deployment of a containerized web application on a cloud platform. The project addresses the common challenges of manual infrastructure provisioning and application deployment, which are often time-consuming, inconsistent, and vulnerable to configuration errors. By integrating infrastructure automation, configuration management, continuous integration, continuous deployment, and security validation into a single workflow, the system provides a practical model for modern software delivery in cloud environments.

The implementation combines Terraform, Ansible, Jenkins, Docker, Checkov, and AWS EC2 to form a complete end-to-end deployment pipeline. Terraform is used to provision the cloud infrastructure, including the EC2 instance, security group, IAM role, and Elastic IP. Ansible is used to configure the deployment environment and automate application release tasks. Jenkins serves as the CI/CD engine that orchestrates source code checkout, security scanning, Docker image building, image publishing, and deployment execution. Docker ensures application portability through containerization, while Checkov is used to scan Terraform files, Ansible playbooks, and container configuration files for security issues before deployment.

The final outcome of the project is a secure and automated delivery pipeline capable of deploying a Node.js web application on AWS with minimal manual intervention. The project demonstrates the practical advantages of DevSecOps practices such as repeatability, faster deployment, reduced human error, and early detection of insecure configurations. CloudSentinel therefore serves as an academic and practical example of how multiple modern DevSecOps tools can be integrated into a unified cloud deployment framework.

## 1 INTRODUCTION

### 1.1 Introduction to Project

CloudSentinel is a cloud-based DevSecOps project designed to automate the deployment lifecycle of a containerized web application. The project integrates infrastructure provisioning, configuration management, continuous integration, continuous deployment, and security scanning into a single operational workflow. It has been developed to demonstrate how modern automation tools can be combined to create a secure and repeatable deployment environment suitable for real-world cloud systems.

The project uses a Node.js web application as the deployment target and AWS EC2 as the hosting platform. Terraform is responsible for provisioning the infrastructure, Ansible is used for configuration management and deployment automation, Jenkins acts as the CI/CD controller, Docker provides the containerized runtime, and Checkov validates infrastructure and deployment configuration from a security perspective. Together, these tools form an end-to-end pipeline that reduces manual dependency and improves operational consistency.

### 1.2 Problem Statement and Description

Traditional deployment practices often rely on manual server setup, direct configuration changes, and repeated command-line operations. Such approaches are difficult to scale, prone to human error, and often lack proper security validation before deployment. As applications and infrastructure grow more complex, the absence of automation can lead to inconsistent runtime environments, delayed releases, and insecure system configurations.

The problem addressed by CloudSentinel is the lack of an integrated framework that provisions infrastructure, validates configuration security, builds application artifacts, and deploys them in a repeatable manner. The project is therefore focused on building a unified DevSecOps workflow in which infrastructure and deployment logic are both codified, security is checked before release, and the final application is deployed automatically to a cloud-hosted environment.

### 1.3 Motivation

The motivation for this project arises from the increasing demand for secure and automated software delivery in cloud environments. Organizations today require faster deployment cycles without compromising infrastructure reliability or application security. Manual workflows cannot efficiently meet these expectations because they introduce delays, inconsistency, and a greater chance of misconfiguration.

Another important motivation is the growing relevance of shift-left security in modern software engineering. Instead of treating security as a final-stage activity, the project incorporates Checkov into the development and deployment workflow so that insecure Terraform, Docker, and Ansible configurations can be detected early. This makes CloudSentinel not only a deployment project but also a practical demonstration of how security can be embedded into DevOps practices.

From an academic point of view, the project is also motivated by the need to understand how multiple industry-standard tools interact in a complete delivery pipeline. Terraform, Ansible, Jenkins, Docker, and Checkov are each powerful on their own, but their combined use provides a stronger understanding of infrastructure as code, automation, and secure cloud operations. This makes the project both educational and practically relevant.

### 1.4 Sustainable Development Goal of the Project

The most relevant Sustainable Development Goal for CloudSentinel is SDG 9: Industry, Innovation and Infrastructure. This goal emphasizes the importance of building resilient infrastructure, promoting sustainable industrialization, and fostering innovation. In the context of software systems, resilient digital infrastructure depends on reliable provisioning methods, consistent deployment workflows, and secure operational practices.

CloudSentinel contributes to this goal by demonstrating how infrastructure automation and secure deployment practices can support modern digital systems. Terraform enables reproducible infrastructure creation, Ansible supports reliable configuration management, and Jenkins automates delivery with reduced operational delay. These elements together encourage better engineering practices and more dependable cloud-based application infrastructure.

The project also supports innovation by showing how multiple open-source tools can be combined to solve deployment and security challenges in a practical way. By reducing manual effort and increasing repeatability, the framework promotes efficient use of technical resources and encourages adoption of scalable, standards-driven deployment practices in future software systems.

## 2 LITERATURE SURVEY

### 2.1 Overview of the Research Area

The fields of DevOps and DevSecOps have become central to modern software engineering due to the increasing demand for faster, more reliable, and more secure software delivery. DevOps focuses on the integration of development and operations practices so that software can be built, tested, and deployed more efficiently. DevSecOps extends this concept by embedding security considerations directly into the software lifecycle, rather than treating security as a separate or final-stage process.

Cloud-based deployment environments have further increased the need for automation. Infrastructure as Code allows cloud resources to be defined programmatically, which improves repeatability and reduces the risk of manual configuration errors. Configuration management tools automate host setup and deployment logic, while CI/CD platforms provide a controlled mechanism for building, validating, and releasing applications. Containerization has also become an important part of this ecosystem because it ensures that the same application environment can be reproduced consistently across systems.

Security validation tools play an increasingly important role in these workflows. Instead of waiting until infrastructure or applications are already deployed, modern DevSecOps practices encourage early scanning of configuration files, deployment scripts, and container specifications. This shift-left approach helps identify insecure settings at the development stage, reducing the risk of propagating misconfigurations into production environments. As a result, the combined use of infrastructure automation, deployment automation, CI/CD, and policy scanning has become a widely adopted strategy in secure cloud operations.

### 2.2 Related Works

Many existing works in cloud automation focus on infrastructure provisioning through tools such as Terraform and CloudFormation. These approaches have shown that declarative infrastructure definitions improve reproducibility, simplify scaling, and reduce setup inconsistencies. However, infrastructure provisioning alone does not fully solve the challenge of application delivery, because runtime configuration and deployment activities must also be coordinated in a reliable manner.

Another group of related works emphasizes configuration management and deployment automation through tools such as Ansible, Puppet, or Chef. These tools are effective for installing dependencies, configuring services, and managing application deployment states across servers. Their contribution lies in replacing manual server administration with codified and repeatable tasks. Even so, configuration management solutions by themselves often do not provide the complete continuous integration and continuous delivery process needed for a full DevSecOps pipeline.

CI/CD platforms such as Jenkins, GitHub Actions, and GitLab CI are also widely discussed in software delivery research and practice. These systems automate code retrieval, building, testing, packaging, and release workflows. Jenkins in particular remains highly relevant because of its flexibility, plugin ecosystem, and suitability for integrating external tools such as Docker, Terraform, Ansible, and security scanners. This makes it a common choice for academic and industrial pipeline demonstrations.

Recent works in DevSecOps have also highlighted the importance of integrating security scanners such as Checkov, Trivy, and similar policy-validation tools into CI/CD pipelines. These tools are used to examine infrastructure code, container definitions, and deployment scripts before release. Their main advantage is that they support early detection of risky configurations, thereby improving cloud security posture without interrupting the speed benefits of automation.

### 2.3 Research Gaps

Although many studies and practical implementations examine infrastructure automation, configuration management, CI/CD, or security scanning individually, fewer examples provide a simple and complete integration of all these components within a single educational project. In many cases, one tool category receives strong attention while the others are treated only briefly, leaving gaps in understanding how these technologies interact in a realistic deployment workflow.

Another gap lies in the accessibility of end-to-end DevSecOps implementations for learners and small-scale project environments. Enterprise deployment models are often too complex for academic use, while simplified tutorials may omit important components such as security validation, infrastructure provisioning, or deployment reproducibility. This creates a need for a compact but realistic framework that demonstrates the complete journey from infrastructure creation to secure application deployment.

CloudSentinel addresses this gap by combining Terraform, Ansible, Jenkins, Docker, Checkov, and AWS EC2 in one coherent pipeline. The project does not treat these tools as isolated technologies, but rather as integrated stages of a secure software delivery process. In this way, it contributes a practical and understandable example of how DevSecOps principles can be applied in a cloud deployment setting.

## 3 FRAMEWORK OVERVIEW AND METHODOLOGY

### 3.1 Framework Overview

The CloudSentinel framework is designed as an integrated DevSecOps workflow that automates infrastructure provisioning, deployment configuration, application packaging, security validation, and final release to a cloud-hosted environment. The framework is centered around the idea that software delivery should not be treated as a sequence of disconnected tasks, but as a coordinated process where infrastructure, application logic, automation scripts, and security checks are all managed together.

At a high level, the workflow begins when source code is stored in a version-controlled repository. Jenkins acts as the central orchestration component and retrieves the latest project files whenever a pipeline run is triggered. During execution, Jenkins first validates the repository through Checkov to identify insecure Terraform, Ansible, or Docker configurations. Once validation succeeds, the application is built into a Docker image, the image is pushed to Docker Hub, and Ansible is then used to deploy the application container to the target EC2 environment.

Terraform is responsible for provisioning the cloud infrastructure required for the deployment process. This includes creating a Jenkins-ready EC2 instance, applying security group rules, defining IAM roles, and attaching an Elastic IP for stable access. Ansible complements this by configuring the target environment and managing deployment tasks in a repeatable way. The final framework therefore creates a complete path from code repository to running application, while integrating automation and security at each stage.

### 3.2 Input Features

Since CloudSentinel is not a machine learning system, the term input features in this project refers to the operational inputs required to execute the DevSecOps workflow. These inputs define the components that are processed, validated, and deployed through the framework. Each of these inputs contributes to the final automated deployment of the application.

The first input is the application source code located in the `app/` directory. This includes the Node.js application files and dependency definitions required for runtime execution. The second input is the `Dockerfile`, which defines the build instructions for packaging the application into a portable container image. The third input consists of the Terraform files inside the `terraform/` directory, which describe the infrastructure resources required for the deployment environment.

The fourth input is the Ansible configuration contained in the `ansible/` directory. These files define server configuration logic and deployment procedures for the application container. The fifth input is the Jenkins pipeline configuration in the `Jenkinsfile`, which determines how scanning, building, pushing, and deployment stages are executed. In addition to these repository-based inputs, the framework also depends on secure runtime inputs such as Docker Hub credentials, SSH or deployment credentials, and environment-specific configuration values required during pipeline execution.

### 3.3 Methodology

The methodology of CloudSentinel follows a sequential but integrated DevSecOps process. The first phase is infrastructure provisioning, where Terraform is used to create the AWS resources required for the project. These resources include the EC2 host, network access rules, IAM attachments, and supporting infrastructure needed for Jenkins and deployment. This phase ensures that the deployment environment is reproducible and does not rely on manually configured cloud resources.

The second phase is environment configuration and deployment automation, where Ansible is used to manage the operational state of the server. Ansible ensures that Docker and required dependencies are available, and it defines the deployment logic for replacing older containers with the latest application version. Using Ansible in this stage improves consistency by replacing ad hoc shell-based deployment with structured and repeatable automation.

The third phase is CI/CD execution through Jenkins. Jenkins checks out the source code, runs Checkov for security validation, installs application dependencies using a containerized Node.js environment, builds the Docker image, and pushes the image to Docker Hub. After the build and push stages complete successfully, Jenkins invokes Ansible to deploy the latest application image to the target EC2 host. This process makes the delivery pipeline repeatable and reduces the possibility of manual deployment mistakes.

The final methodological principle applied in the project is shift-left security. Security validation is performed before deployment through Checkov, which scans Terraform files, Docker configuration, and Ansible playbooks for insecure definitions. This ensures that the deployment pipeline does not simply automate release, but also verifies that the surrounding infrastructure and deployment instructions follow secure practices. As a result, the methodology combines automation and security into a unified cloud deployment model.

## 4 FRAMEWORK IMPLEMENTATION

### 4.1 Infrastructure Provisioning using Terraform

Terraform was used in CloudSentinel to provision the cloud infrastructure required for hosting Jenkins and the target deployment environment. The Terraform configuration defines the AWS provider settings, variable inputs, networking access rules, IAM associations, and the EC2 instance required for the project. By expressing infrastructure as code, the project avoids manual cloud setup and allows the environment to be recreated consistently whenever required.

The Terraform configuration includes the creation of a security group for Jenkins and application access, along with restricted ingress rules for SSH and Jenkins UI usage. It also defines an IAM role and instance profile for the EC2 instance so that supporting services can be integrated more securely. The EC2 instance itself is configured with properties such as encrypted storage, EBS optimization, monitoring, and metadata service settings. An Elastic IP association is also used so that the deployed environment can be accessed through a stable public address rather than a changing instance IP.

This implementation demonstrates the practical value of Terraform in deployment automation. Infrastructure elements that would normally require repeated manual interaction in the AWS console are instead declared in a version-controlled form. This not only improves consistency but also makes the environment auditable, portable, and easier to validate using security scanning tools such as Checkov.

### 4.2 Configuration Management using Ansible

Ansible was implemented to handle post-provisioning configuration and deployment automation in the CloudSentinel framework. Its role in the project is to ensure that the target environment is properly prepared for application deployment and that the final release process is repeatable. Instead of relying on manual SSH sessions and direct command execution, Ansible defines the configuration steps in playbooks that can be executed consistently across runs.

The Ansible implementation includes playbooks for configuring the Jenkins host and for deploying the application container. The configuration playbook installs core dependencies such as Docker, Jenkins prerequisites, and supporting packages. The deployment playbook pulls the latest application image from Docker Hub, removes any previously running container, clears port conflicts if necessary, and runs the latest container using the required host-to-container port mapping. This ensures that deployment logic is not scattered across manual commands but captured in reusable automation.

Another important aspect of the implementation is the use of local Ansible connection in the Jenkins-based deployment stage. Since Jenkins and the application deployment target operate on the same EC2 host in the final setup, Ansible can run locally on the machine and execute deployment tasks directly. This reduces complexity by removing unnecessary SSH-based deployment steps while still preserving the advantages of structured automation.

### 4.3 CI/CD Pipeline Implementation using Jenkins

Jenkins was implemented as the central orchestration tool of the CloudSentinel CI/CD pipeline. The pipeline is defined in a `Jenkinsfile`, which allows each delivery stage to be version-controlled together with the application source code and infrastructure files. This ensures that the automation logic itself is reproducible and remains synchronized with the project repository.

The Jenkins pipeline begins by checking out the latest source code from the GitHub repository. It then runs a security scan using Checkov to validate Terraform, Docker, and Ansible files before moving to the build stages. Application dependencies are installed in a Dockerized Node.js environment, which avoids dependency mismatch between build hosts. After this, the pipeline builds the Docker image for the application and pushes the image to Docker Hub using credentials managed securely within Jenkins.

The final stage of the pipeline performs deployment through Ansible. Jenkins generates a temporary inventory for local execution and invokes the Ansible deployment playbook to release the latest application container. This CI/CD implementation demonstrates how Jenkins can connect validation, packaging, image publishing, and deployment into one continuous automated process. It also ensures that every deployment follows the same repeatable path, thereby reducing the risk of configuration drift and deployment inconsistency.

### 4.4 Docker-Based Application Packaging

Docker was used in CloudSentinel to package the Node.js web application into a portable and reproducible container image. This container-based approach ensures that the application behaves consistently across different environments, regardless of the host machine’s native package state. It also simplifies deployment by allowing the complete application runtime to be transferred and executed as a single image.

The Dockerfile used in the project defines a Node.js base image, sets an application working directory, copies dependency definition files, installs the application packages, and then copies the project source into the container. The image is configured to run under a non-root user, expose the application port, and include a health check that verifies the web server is responding correctly. These implementation choices reflect secure and maintainable container practices.

Packaging the application through Docker also improves integration with Jenkins and Ansible. Jenkins can build and push a standard image to Docker Hub, while Ansible only needs to pull that image and run it on the target host. This clear separation between build-time packaging and deployment-time execution is an important advantage of container-based delivery workflows.

### 4.5 Security Validation using Checkov

Checkov was integrated into the framework as the primary security scanning tool for validating infrastructure and deployment configuration. Instead of restricting validation to the application code alone, the project extends security scanning to the surrounding operational definitions, including Terraform files, Docker configuration, and Ansible playbooks. This reflects the DevSecOps principle that infrastructure and deployment logic should be secured in the same way as source code.

During implementation, Checkov was executed within the Jenkins pipeline using a Dockerized scanner image. It scans the repository before the build and deployment stages are allowed to continue. This means that insecure configurations such as unsafe network rules, weak infrastructure settings, or risky container practices can be detected before they affect the deployment environment. By embedding this step early in the pipeline, CloudSentinel applies a shift-left security strategy in a practical way.

The use of Checkov also improves the academic value of the project because it demonstrates that automation alone is not sufficient for reliable cloud deployment. Secure automation requires verification, and Checkov provides that verification across multiple configuration layers. As a result, the project implementation not only automates delivery but also actively validates the security posture of the deployment workflow.

### 4.6 Deployment Workflow

The final deployment workflow of CloudSentinel combines all implemented technologies into a single release path. After the source code is validated and the Docker image is built and pushed, Jenkins triggers Ansible to deploy the latest application container. The deployment target is the EC2 host that also runs Jenkins, resulting in a same-host deployment model in which Jenkins operates as the automation controller while the application is exposed separately as a containerized service.

In the implemented setup, Jenkins uses port `8080`, while the deployed application is mapped to host port `8081`. The application itself runs inside the container on port `8080`, and Docker performs the required host-to-container mapping. During each deployment, any older application container is removed, conflicting published ports are cleared if necessary, and the newest image is launched. This ensures that the deployment always uses the latest validated build rather than a stale runtime state.

The workflow is significant because it demonstrates a complete DevSecOps cycle in a compact environment. The same deployment path can be repeated after every valid pipeline run, making the system consistent and easy to maintain. Even though the project uses a small-scale single-host model, the implemented workflow reflects real DevSecOps principles and can be extended to more complex environments in the future.

## 5 EXPERIMENTAL RESULTS AND DISCUSSION

### 5.1 Experimental Setup

The CloudSentinel framework was evaluated in a practical cloud deployment environment using AWS EC2 as the hosting platform. The EC2 instance was configured to host Jenkins as the CI/CD controller and Docker as the runtime environment for the web application container. Terraform was used to define the infrastructure, while Ansible handled deployment automation on the target host. The application itself was a lightweight Node.js web service packaged as a Docker image and stored in Docker Hub for pull-based deployment.

The Jenkins pipeline was configured to process the project repository, scan the infrastructure and deployment files using Checkov, build the Docker image, push the image to Docker Hub, and then invoke Ansible to deploy the latest image. In the final configuration, Jenkins ran on port `8080`, and the web application was made available on port `8081`. This allowed both the automation environment and the deployed service to coexist on the same host while remaining independently accessible.

The experimental setup was intended to validate not only whether the application could be deployed successfully, but also whether the integrated DevSecOps workflow behaved consistently across repeated runs. Key points of observation included successful infrastructure definition validation, container image creation, image publication, application deployment, and final service accessibility through the browser.

### 5.2 Performance Comparison

One of the major advantages demonstrated by the CloudSentinel framework was the reduction of manual operational effort. In a manual deployment process, the user would need to create or configure infrastructure, log in to the server, install dependencies, build or transfer the application, manage the runtime environment, and manually restart or replace the deployed service. Each of these steps introduces a possibility of configuration drift or human error.

In contrast, the automated workflow created by CloudSentinel condensed these tasks into a repeatable pipeline. Infrastructure could be provisioned through Terraform, deployment tasks could be executed through Ansible, and Jenkins connected scanning, building, image publishing, and release into a single sequence. This automation significantly improved deployment consistency because the same steps were executed in the same order on every valid run. It also improved repeatability by ensuring that future deployments did not depend on memory-based or undocumented server-side procedures.

From a practical perspective, the automated workflow also improved security visibility. In a manual process, insecure Terraform rules, container settings, or deployment definitions might remain unnoticed until after deployment. In CloudSentinel, these risks were reduced through Checkov scanning before the build and deployment stages. Therefore, the comparison is not only about speed, but also about reliability, traceability, and security assurance.

### 5.3 Visual Outputs

The visual outputs of the project provide direct evidence that the implemented DevSecOps workflow operated successfully. Jenkins pipeline screenshots can be used to show the successful completion of all major stages, including code checkout, security scanning, application build, Docker image push, and Ansible-based deployment. Checkov scan output screenshots can be used to demonstrate that Terraform, Docker, and Ansible configurations were validated before deployment.

Another important visual output is the browser-based verification of the deployed application running on port `8081`. This output confirms that the deployment did not stop at the image push stage, but resulted in an active and accessible web application on the target EC2 host. Additional screenshots from the AWS console or Jenkins dashboard may also be included to support the explanation of the deployment environment and execution flow.

These visual artifacts are useful in the report because they provide concrete confirmation of system behavior. Rather than describing the success of the workflow in only textual form, screenshots allow the reader to observe the actual execution state of the pipeline and the deployed application. When placed carefully with clear captions, they strengthen the credibility of the implementation results.

### 5.4 Discussion

The experimental results indicate that CloudSentinel successfully demonstrates the core objectives of a DevSecOps workflow. The project shows that infrastructure provisioning, configuration management, CI/CD automation, containerization, and security validation can be combined into a single integrated framework. The use of Terraform and Ansible gives the project a strong automation foundation, while Jenkins provides the orchestration needed to connect each stage into a functional pipeline.

The results also highlight the importance of security validation in automated delivery. The integration of Checkov ensures that the workflow does not simply accelerate deployment, but also checks whether the associated infrastructure and configuration definitions follow secure practices. This is a valuable outcome because it reflects the real purpose of DevSecOps, which is not just speed, but secure and reliable automation.

At the same time, the project has some limitations. The final deployment model is based on a single EC2 instance hosting both Jenkins and the application, which is practical for learning and demonstration but not ideal for large-scale production use. The project also does not yet include automated application testing, HTTPS reverse proxy integration, or advanced monitoring. These limitations do not reduce the educational value of the project, but they identify clear directions for future enhancement.

Overall, the discussion shows that CloudSentinel is effective as a compact and realistic demonstration of secure cloud deployment automation. It captures the practical relationship between infrastructure as code, configuration management, CI/CD execution, containerized deployment, and security scanning in a way that is understandable, reproducible, and extensible.

## 6 CONCLUSION AND FUTURE WORK

### 6.1 Conclusion

CloudSentinel was developed as a practical DevSecOps project to demonstrate secure and automated deployment of a containerized web application on AWS. The project successfully integrated Terraform for infrastructure provisioning, Ansible for deployment configuration, Jenkins for CI/CD automation, Docker for application packaging, and Checkov for pre-deployment security validation. By combining these technologies into one delivery workflow, the project achieved a repeatable and structured deployment process that reduced manual intervention and improved overall consistency.

The implementation showed that infrastructure creation, application packaging, security validation, and deployment can be coordinated effectively within a single automation framework. The use of Terraform ensured that cloud resources could be defined reproducibly, while Ansible replaced manual operational steps with organized deployment logic. Jenkins connected these activities into a continuous pipeline, and Docker ensured that the application ran in a predictable runtime environment. Checkov further strengthened the workflow by scanning infrastructure, container, and deployment definitions before release.

Overall, the project demonstrates that DevSecOps is not limited to only fast deployment, but also includes secure and manageable automation across the software delivery lifecycle. CloudSentinel therefore serves as a meaningful academic example of how infrastructure as code, CI/CD, configuration management, and security scanning can be integrated into a unified cloud deployment solution.

### 6.2 Future Work

Although CloudSentinel achieves its core objectives successfully, there are several directions in which the project can be enhanced. One immediate improvement would be the addition of automated application testing in the Jenkins pipeline so that functional correctness is validated alongside configuration security. This would strengthen the CI/CD process by ensuring that both the application and the deployment definitions are checked before release.

Another area for improvement is production-readiness of the deployment environment. The current implementation uses a single EC2 host for both Jenkins and the application, which is suitable for demonstration but not ideal for larger workloads. Future versions of the project could separate the automation controller and the deployed application onto different servers, use a reverse proxy with HTTPS, and include more controlled credential and secret management practices.

The project can also be extended toward more advanced cloud-native deployment models. Examples include integration with Kubernetes or Amazon EKS, addition of monitoring and alerting tools such as Prometheus and Grafana, and implementation of notification systems for pipeline events. These improvements would expand CloudSentinel from a compact demonstration project into a more scalable and production-aligned DevSecOps framework.

## REFERENCES

1. HashiCorp, “Terraform Documentation.” Available: https://developer.hashicorp.com/terraform/docs. Accessed: Apr. 27, 2026.
2. Ansible Community, “Ansible Documentation.” Available: https://docs.ansible.com/. Accessed: Apr. 27, 2026.
3. Jenkins Project, “Jenkins User Documentation.” Available: https://www.jenkins.io/doc/. Accessed: Apr. 27, 2026.
4. Jenkins Project, “Pipeline.” Available: https://www.jenkins.io/doc/book/pipeline/. Accessed: Apr. 27, 2026.
5. Docker Inc., “Docker Docs.” Available: https://docs.docker.com/. Accessed: Apr. 27, 2026.
6. Docker Inc., “Docker Hub.” Available: https://docs.docker.com/docker-hub/. Accessed: Apr. 27, 2026.
7. Palo Alto Networks, “Checkov Documentation.” Available: https://www.checkov.io/. Accessed: Apr. 27, 2026.
8. Palo Alto Networks, “What is Checkov?” Available: https://www.checkov.io/1.Welcome/What%20is%20Checkov.html. Accessed: Apr. 27, 2026.
9. OpenJS Foundation, “Node.js Documentation.” Available: https://nodejs.org/en/docs/. Accessed: Apr. 27, 2026.
10. GitHub, “Webhooks Documentation.” Available: https://docs.github.com/en/webhooks. Accessed: Apr. 27, 2026.
11. Amazon Web Services, “Amazon EC2 Documentation.” Available: https://aws.amazon.com/documentation-overview/ec2/. Accessed: Apr. 27, 2026.
12. Amazon Web Services, “Elastic IP Addresses - Amazon EC2 User Guide.” Available: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html. Accessed: Apr. 27, 2026.
13. Amazon Web Services, “Control Traffic to Your AWS Resources Using Security Groups - Amazon VPC.” Available: https://docs.aws.amazon.com/vpc/latest/userguide/vpc-security-groups.html. Accessed: Apr. 27, 2026.
14. Amazon Web Services, “Create a Security Group for Your VPC - Amazon VPC.” Available: https://docs.aws.amazon.com/vpc/latest/userguide/creating-security-groups.html. Accessed: Apr. 27, 2026.
15. Amazon Web Services, “Use Instance Profiles - AWS Identity and Access Management.” Available: https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_use_switch-role-ec2_instance-profiles.html. Accessed: Apr. 27, 2026.
16. Docker Inc., “What is Docker?” Available: https://docs.docker.com/engine/docker-overview/. Accessed: Apr. 27, 2026.
17. Amazon Web Services, “Security Group Rules.” Available: https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/security-group-rules.html. Accessed: Apr. 27, 2026.

## Appendix

## A Coding

Appendix A should include only short and representative code excerpts from the project. The purpose of this section is to support the implementation discussion, not to reproduce the entire codebase in the report. Each code excerpt should be preceded by a one-line explanation of its role in the framework.

Suggested code excerpts:
- Terraform configuration for EC2 and security group creation from `terraform/main.tf`
- Ansible deployment playbook excerpt from `ansible/deploy-app.yml`
- Jenkins pipeline stages from `Jenkinsfile`
- Node.js application entry point from `app/index.js`

If the report approaches the 27-page limit, reduce the appendix before cutting analytical chapters. The main body should remain focused on explanation, architecture, methodology, implementation, and results, while long code listings should be kept to a minimum.
