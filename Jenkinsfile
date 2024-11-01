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

        stage('Check Changes') {
            steps {
                script {
                    def frontendChanged = sh(script: "git diff --name-only HEAD^ HEAD | grep '^client/aissue'", returnStatus: true) == 0
                    def backendChanged = sh(script: "git diff --name-only HEAD^ HEAD | grep '^server'", returnStatus: true) == 0

                    env.FRONTEND_CHANGED = frontendChanged ? 'true' : 'false'
                    env.BACKEND_CHANGED = backendChanged ? 'true' : 'false'
                }
            }
        }

        stage('Load Backend .env File') {
            when {
                expression { env.BACKEND_CHANGED == 'true' }
            }
            steps {
                withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
                    sh 'export $(grep -v "^#" $ENV_FILE | xargs)'  // 필요한 경우 환경 변수로 로드
                }
            }
        }

        stage('Build Backend') {
            when {
                expression { env.BACKEND_CHANGED == 'true' }
            }
            steps {
                withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
                    dir('server') {
                        sh 'chmod +x gradlew'
                        sh './gradlew clean build -x test'
                    }
                }
            }
        }

        stage('Build Frontend') {
            when {
                expression { env.FRONTEND_CHANGED == 'true' }
            }
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
                script {
                    def services = []
                    if (env.FRONTEND_CHANGED == 'true') {
                        services << "frontend"
                    }
                    if (env.BACKEND_CHANGED == 'true') {
                        services << "backend"
                    }
                    
                    if (services) {
                        if (env.BACKEND_CHANGED == 'true') {
                            withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
                                sh 'docker-compose down'
                                sh "docker-compose --env-file $ENV_FILE build --no-cache backend"
                                sh "docker-compose --env-file $ENV_FILE up -d --no-deps backend"
                            }
                        }
                        if (env.FRONTEND_CHANGED == 'true') {
                            sh "docker-compose build --no-cache frontend"
                            sh "docker-compose up -d --no-deps frontend"
                        }
                    } else {
                        echo "No changes detected in frontend or backend. Skipping deployment."
                    }
                }
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



// pipeline {
//     agent any

//     environment {
//         DOCKER_BUILDKIT = '1'
//         NEXT_PUBLIC_API_URL = 'http://k11a403.p.ssafy.io'
//         SPRING_PROFILES_ACTIVE = 'prod'
//     }

//     stages {
//         stage('Checkout') {
//             steps {
//                 checkout scm
//             }
//         }

//         stage('Check Changes') {
//             steps {
//                 script {
//                     // git diff로 변경 사항 확인
//                     def frontendChanged = sh(script: "git diff --name-only HEAD^ HEAD | grep '^client/aissue'", returnStatus: true) == 0
//                     def backendChanged = sh(script: "git diff --name-only HEAD^ HEAD | grep '^server'", returnStatus: true) == 0

//                     // 변경 플래그 설정
//                     env.FRONTEND_CHANGED = frontendChanged ? 'true' : 'false'
//                     env.BACKEND_CHANGED = backendChanged ? 'true' : 'false'
//                 }
//             }
//         }

//         stage('Load .env File') {
//             steps {
//                 withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
//                     // `.env` 파일을 환경 변수로 로드
//                     sh 'export $(grep -v "^#" $ENV_FILE | xargs)'
//                 }
//             }
//         }

//         stage('Build Backend') {
//             when {
//                 expression { env.BACKEND_CHANGED == 'true' }
//             }
//             steps {
//                 dir('server') {
//                     sh 'chmod +x gradlew'
//                     sh './gradlew clean build -x test'
//                 }
//             }
//         }

//         stage('Build Frontend') {
//             when {
//                 expression { env.FRONTEND_CHANGED == 'true' }
//             }
//             steps {
//                 dir('client/aissue') {
//                     sh '''
//                     docker run --rm -u $(id -u):$(id -g) -v "$PWD":/app -w /app node:20.15.1 bash -c "
//                     npm install &&
//                     npm run build
//                     "
//                     '''
//                 }
//             }
//         }
//         stage('Deploy with Docker Compose') {
//             steps {
//                 withCredentials([file(credentialsId: 'MY_ENV_FILE', variable: 'ENV_FILE')]) {
//                     script {
//                         def services = []
//                         if (env.FRONTEND_CHANGED == 'true') {
//                             services << "frontend"
//                         }
//                         if (env.BACKEND_CHANGED == 'true') {
//                             services << "backend"
//                         }
                        
//                         if (services) {
//                             sh 'docker-compose down'
//                             sh """
//                             docker-compose --env-file $ENV_FILE build --no-cache --parallel ${services.join(" ")}
//                             """
//                             sh "docker-compose --env-file $ENV_FILE up -d --no-deps ${services.join(" ")}"
//                         } else {
//                             echo "No changes detected in frontend or backend. Skipping deployment."
//                         }
//                     }
//                 }
//             }
//         }
//     }
//     //     stage('Deploy with Docker Compose') {
//     //         steps {
//     //             script {
//     //                 // 변경된 서비스만 docker-compose로 빌드 및 실행
//     //                 def services = []
//     //                 if (env.FRONTEND_CHANGED == 'true') {
//     //                     services << "frontend"
//     //                 }
//     //                 if (env.BACKEND_CHANGED == 'true') {
//     //                     services << "backend"
//     //                 }
                    
//     //                 if (services) {
//     //                     sh 'docker-compose down'
//     //                     sh """
//     //                     docker-compose build --no-cache --parallel \
//     //                       --build-arg NEXT_PUBLIC_API_URL=${env.NEXT_PUBLIC_API_URL} \
//     //                       --build-arg SPRING_PROFILES_ACTIVE=${env.SPRING_PROFILES_ACTIVE} \
//     //                       ${services.join(" ")}
//     //                     """
//     //                     sh "docker-compose up -d --no-deps ${services.join(" ")}"
//     //                 } else {
//     //                     echo "No changes detected in frontend or backend. Skipping deployment."
//     //                 }
//     //             }
//     //         }
//     //     }
//     // }

//     post {
//         always {
//             echo 'Pipeline finished.'
//         }
//         failure {
//             echo 'Pipeline failed.'
//         }
//     }
// }
