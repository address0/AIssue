pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
        NEXT_PUBLIC_API_URL = 'http://k11a403.p.ssafy.io'
        SPRING_PROFILES_ACTIVE = 'prod'
              
        S3_BUCKET = credentials('S3_BUCKET')
        S3_REGION = credentials('S3_REGION')
        S3_ACCESS_KEY = credentials('S3_ACCESS_KEY_ID')
        S3_SECRET_KEY = credentials('S3_SECRET_ACCESS_KEY')
        SECRET_KEY = credentials('JWT_SECRET_KEY')
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
                    sh 'chmod +x gradlew'
                    sh './gradlew clean build -x test'
                }
            }
        }
        stage('Build Frontend') {
            steps {
                dir('client/aissue') {
                     sh '''
                    docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app node:20.15.1 bash -c "
                    npm install &&
                    npm run build
                    "
                    '''
                }
            }
        }
        stage('Deploy with Docker Compose') {
            steps {
                sh 'docker-compose down'
                sh """
                docker-compose build --no-cache --parallel \
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
