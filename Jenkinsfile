pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        DOCKER_IMAGE = "happi2307/devsecops-app"
        CONTAINER_NAME = "cloudsentinel-app"
        EC2_IP = "65.2.181.27"
        EC2_USER = "ubuntu"
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Security Scan') {
            steps {
                bat 'echo Running Checkov scan... && docker run --rm -v "%WORKSPACE%:/repo" bridgecrew/checkov:latest -d /repo'
            }
        }

        stage('Build App') {
            steps {
                dir('app') {
                    bat 'npm install'
                }
            }
        }

        stage('Docker Build') {
            steps {
                bat 'docker build -t %DOCKER_IMAGE% .'
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-creds') {
                        bat 'docker push %DOCKER_IMAGE%'
                    }
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh',
                    keyFileVariable: 'SSH_KEY',
                    usernameVariable: 'SSH_USER'
                )]) {
                    powershell '''
                    $keyPath = $env:SSH_KEY
                    $currentUser = [System.Security.Principal.WindowsIdentity]::GetCurrent().Name
                    icacls $keyPath /inheritance:r | Out-Null
                    icacls $keyPath /grant:r "${currentUser}:R" | Out-Null
                    ssh -i $keyPath -o StrictHostKeyChecking=no "$($env:SSH_USER)@$($env:EC2_IP)" "docker pull $($env:DOCKER_IMAGE) && (docker stop $($env:CONTAINER_NAME) || true) && (docker rm $($env:CONTAINER_NAME) || true) && docker run -d --name $($env:CONTAINER_NAME) -p 8080:8080 $($env:DOCKER_IMAGE)"
                    '''
                }
            }
        }
    }
}
