pipeline {
    agent any

    environment {
        AWS_DEFAULT_REGION    = 'ap-southeast-2'
        AWS_ACCOUNT_ID        = '500345929326'
        AWS_ACCESS_KEY_ID     = credentials('aws-access-key')
        AWS_SECRET_ACCESS_KEY = credentials('aws-secret-key')
    }

    stages {

        stage('Terraform Init') {
            steps {
                dir('terraform') {
                    sh 'terraform init -input=false'
                }
            }
        }

        stage('Terraform Validate') {
            steps {
                dir('terraform') {
                    sh 'terraform validate'
                }
            }
        }

        stage('Terraform Plan') {
            steps {
                dir('terraform') {
                    sh 'terraform plan -input=false -out=tfplan'
                }
            }
        }

        stage('Approval') {
            steps {
                input message: 'Apply this Terraform plan to infrastructure?', ok: 'Apply'
            }
        }

        stage('Terraform Apply') {
            steps {
                dir('terraform') {
                    sh 'terraform apply -input=false tfplan'
                }
            }
        }
    }

    post {
        success {
            echo '✅ Infra pipeline done! VPC/EKS/ECR provisioned or updated.'
        }
        failure {
            echo '❌ Terraform pipeline failed! Check plan/apply logs.'
        }
        always {
            dir('terraform') {
                sh 'rm -f tfplan || true'
            }
        }
    }
}