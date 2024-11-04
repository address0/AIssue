pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
        SPRING_PROFILES_ACTIVE = 'prod'
        NEXT_PUBLIC_SERVER_URL = 'http://k11a403.p.ssafy.io/api'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Load Env File') {
            steps {
                withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
                    sh 'cp $ENV_FILE .env' // 프로젝트 루트에 .env 파일 복사
                }
            }
        }

        stage('Build Backend') {
            steps {
                dir('server') {
                    withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
                        sh 'export $(grep -v "^#" $ENV_FILE | xargs)'  // 환경 변수 로드
                    }
                    sh 'chmod +x gradlew'
                    sh './gradlew clean build -x test'
                }
            }
        }

        stage('Build Frontend') {
            steps {
                dir('client/aissue') {
                    sh '''
                    docker run --rm -u $(id -u):$(id -g) \
                      --env-file ../../.env \
                      -v "$PWD":/app -w /app node:20.15.1 bash -c "
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
                docker-compose --env-file .env build --no-cache --parallel \
                  --build-arg NEXT_PUBLIC_SERVER_URL=${env.NEXT_PUBLIC_SERVER_URL} \
                  --build-arg SPRING_PROFILES_ACTIVE=${env.SPRING_PROFILES_ACTIVE}
                """
                sh 'docker-compose --env-file .env up -d'
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
