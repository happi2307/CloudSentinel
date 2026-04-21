pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    environment {
        DOCKER_IMAGE = 'happi2307/devsecops-app'
        EC2_IP = '13.201.189.7'
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

        stage('Ansible Deploy') {
            steps {
                withCredentials([sshUserPrivateKey(
                    credentialsId: 'ec2-ssh',
                    keyFileVariable: 'SSH_KEY'
                )]) {
                    sh '''
                        chmod 600 "$SSH_KEY"
                        cat > ansible/inventory.ini <<EOF
[app]
app-host ansible_host=$EC2_IP ansible_user=$EC2_USER ansible_ssh_private_key_file=$SSH_KEY
EOF
                        ansible-playbook ansible/deploy-app.yml \
                          -i ansible/inventory.ini \
                          --extra-vars "docker_image=$DOCKER_IMAGE app_port=$APP_PORT"
                    '''
                }
            }
        }
    }
}
