pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // Git에서 코드 가져오기
                checkout([$class: 'GitSCM', branches: [[name: '*/release']],
                  userRemoteConfigs: [[url: 'https://lab.ssafy.com/s11-final/S11P31A403.git']]])
            }
        }

        stage('Backend Build') {
            steps {
                dir('server') {
                    // Gradle로 Spring 빌드
                    sh './gradlew clean build -x test'
                }
            }
        }

        stage('Frontend Build') {
            steps {
                dir('client/aissue') {
                    // Next.js 빌드
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build and Deploy') {
            steps {
                // Docker Compose를 통해 전체 서비스 빌드 및 배포
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }
}
