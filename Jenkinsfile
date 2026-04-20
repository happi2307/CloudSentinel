pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        DOCKER_IMAGE = 'happi2307/devsecops-app'
        EC2_IP = '13.206.102.28'
        EC2_USER = 'ubuntu'
        APP_PORT = '8081'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Security Scan') {
            steps {
                sh '''
                    echo "Running Checkov scan..."
                    docker run --rm -v "$WORKSPACE:/repo" bridgecrew/checkov:latest -d /repo
                '''
            }
        }

        stage('Build App') {
            steps {
                dir('app') {
                    sh '''
                        docker run --rm -v "$PWD:/app" -w /app node:18 npm install
                    '''
                }
            }
        }

        stage('Docker Build') {
            steps {
                sh '''
                    docker build -t "$DOCKER_IMAGE" .
                '''
            }
        }

        stage('Docker Push') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'docker-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push "$DOCKER_IMAGE"
                    '''
                }
            }
        }

        stage('Deploy to EC2') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh '''
                        chmod 600 "$SSH_KEY"
                        ssh -i "$SSH_KEY" -o StrictHostKeyChecking=no "$EC2_USER@$EC2_IP" '
                          set -e
                          docker pull '"$DOCKER_IMAGE"'
                          docker rm -f cloudsentinel-app >/dev/null 2>&1 || true
                          existing_ids=$(docker ps -aq --filter "publish='"$APP_PORT"'")
                          if [ -n "$existing_ids" ]; then
                            docker rm -f $existing_ids
                          fi
                          docker run -d --name cloudsentinel-app -p '"$APP_PORT"':8080 '"$DOCKER_IMAGE"'
                        '
                    '''
                }
            }
        }
    }
}
