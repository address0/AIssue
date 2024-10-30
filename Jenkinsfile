pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // GitLab에서 소스 코드 체크아웃
                git branch: 'release', url: 'https://gitlab.com/your-repo.git'
            }
        }
        
        stage('Backend Build') {
            steps {
                dir('server') {
                    // Gradle 빌드
                    sh './gradlew clean build -x test'
                }
            }
        }
        
        stage('Frontend Build') {
            steps {
                dir('client') {
                    // Next.js 빌드
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }

        stage('Docker Build and Deploy') {
            steps {
                // Docker Compose를 사용하여 빌드 및 배포
                sh 'docker-compose down'
                sh 'docker-compose up -d --build'
            }
        }
    }
}
