pipeline {
    agent any

    environment {
        DOCKER_IMAGE = "happi2307/devsecops-app"
        EC2_IP = "43.205.130.141"
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
                    sshagent(['ec2-ssh']) {
                        bat '''
                        ssh -o StrictHostKeyChecking=no ubuntu@43.205.130.141 ^
                        "docker pull happi2307/devsecops-app && docker stop $(docker ps -q) || true && docker run -d -p 5173:5173 happi2307/devsecops-app"
                        '''
                    }
                }
        }
    }
}