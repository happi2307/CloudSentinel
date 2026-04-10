pipeline {
    agent any

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
                bat 'echo Running Checkov scan... && checkov -d .'
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

        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'USER',
                    passwordVariable: 'PASS'
                )]) {
                    bat 'echo %PASS% | docker login -u %USER% --password-stdin'
                }
            }
        }

        stage('Docker Push') {
            steps {
                bat 'docker push %DOCKER_IMAGE%'
            }
        }

        stage('Deploy to EC2') {
            steps {
                sshagent(credentials: ['ec2-ssh']) {
                    bat 'ssh -o StrictHostKeyChecking=no %EC2_USER%@%EC2_IP% "docker pull %DOCKER_IMAGE% && (docker stop %CONTAINER_NAME% || true) && (docker rm %CONTAINER_NAME% || true) && docker run -d --name %CONTAINER_NAME% -p 8080:8080 %DOCKER_IMAGE%"'
                }
            }
        }
    }
}
