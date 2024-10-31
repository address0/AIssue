pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
        NEXT_PUBLIC_API_URL = 'http://k11a403.p.ssafy.io'
        SPRING_PROFILES_ACTIVE = 'prod'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Backend') {
            steps {
                dir('server') {
                    sh './gradlew clean build -x test'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('client/aissue/src') {
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker-compose down'
                sh """
                docker-compose build --parallel \
                  --build-arg NEXT_PUBLIC_API_URL=${env.NEXT_PUBLIC_API_URL} \
                  --build-arg SPRING_PROFILES_ACTIVE=${env.SPRING_PROFILES_ACTIVE}
                """
                sh 'docker-compose up -d'
            }
        }
    }
    post {
        always {
            echo 'Pipeline finished.'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
}
