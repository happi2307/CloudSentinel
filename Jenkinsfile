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
                sh 'echo "Running Checkov scan..." && docker run --rm -v "$WORKSPACE:/repo" bridgecrew/checkov:latest -d /repo'
            }
        }

        stage('Build App') {
            steps {
                dir('app') {
                    sh 'docker run --rm -v "$PWD:/app" -w /app node:18 npm install'
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t "$DOCKER_IMAGE" .'
            }
        }

        stage('Docker Push') {
            steps {
                script {
                    docker.withRegistry('https://index.docker.io/v1/', 'docker-creds') {
                        sh 'docker push "$DOCKER_IMAGE"'
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
                    sh '''
                    chmod 600 "$SSH_KEY"
                    ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$SSH_USER@$EC2_IP" '
                      docker pull '"$DOCKER_IMAGE"' &&
                      docker rm -f '"$CONTAINER_NAME"' >/dev/null 2>&1 || true
                      existing_ids=$(docker ps -aq --filter "publish=8080")
                      if [ -n "$existing_ids" ]; then
                        docker rm -f $existing_ids
                      fi
                      docker run -d --name '"$CONTAINER_NAME"' -p 8080:8080 '"$DOCKER_IMAGE"'
                    '
                    '''
                }
            }
        }
    }
}
