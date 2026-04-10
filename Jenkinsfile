pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "happi2307/devsecops-app"
        EC2_IP = "65.2.181.27"
    }

    stages {

        stage('Security Scan') {
            steps {
                bat 'echo Running Checkov scan...'
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
            bat """
            docker login -u %USER% -p %PASS%
            """
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
                bat '''
                ssh -i C:\\Users\\Akshat\\Downloads\\CloudSentinel\\devsecops-key.pem -o StrictHostKeyChecking=no ubuntu@%EC2_IP% ^
                "docker pull %DOCKER_IMAGE% && docker stop $(docker ps -q) || true && docker run -d -p 8080:8080 %DOCKER_IMAGE%"
                '''
            }
        }
    }
}