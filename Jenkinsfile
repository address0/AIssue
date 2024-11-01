pipeline {
    agent any

    environment {
        DOCKER_BUILDKIT = '1'
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
                withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
                    dir('server') {
                        // `.env` 파일을 환경 변수로 로드하여 빌드
                        sh 'export $(grep -v "^#" $ENV_FILE | xargs)'
                        sh 'chmod +x gradlew'
                        sh './gradlew clean build -x test'
                    }
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
                withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
                    sh 'cat $ENV_FILE'

                    sh 'docker-compose down'
                    sh """
                    docker-compose --env-file $ENV_FILE build --no-cache --parallel \
                      --build-arg NEXT_PUBLIC_SERVER_URL=${env.NEXT_PUBLIC_SERVER_URL} \
                      --build-arg SPRING_PROFILES_ACTIVE=${env.SPRING_PROFILES_ACTIVE}
                    """
                    sh 'docker-compose --env-file $ENV_FILE up -d'
                }
            }
        }
    }

        // stage('Deploy with Docker Compose') {
        //     steps {
        //         withCredentials([file(credentialsId: 'dev-be-env-file', variable: 'ENV_FILE')]) {
        //             // .env 파일 내용 출력 (디버그용)
        //             sh 'cat $ENV_FILE'

        //             sh 'docker-compose down'
        //             sh """
        //             docker-compose --env-file $ENV_FILE build --no-cache --parallel \
        //             --build-arg NEXT_PUBLIC_API_URL=${env.NEXT_PUBLIC_API_URL} \
        //             --build-arg SPRING_PROFILES_ACTIVE=${env.SPRING_PROFILES_ACTIVE}
        //             """
        //             sh 'docker-compose --env-file $ENV_FILE up -d frontend backend'
        //         }
        //     }
        // }



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
//         stage('Build Backend') {
//             steps {
//                 dir('server') {
//                     sh 'chmod +x gradlew'
//                     sh './gradlew clean build -x test'
//                 }
//             }
//         }
//         stage('Build Frontend') {
//             steps {
//                 dir('client/aissue') {
//                      sh '''
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
//                 sh 'docker-compose down'
//                 sh """
//                 docker-compose build --no-cache --parallel \
//                   --build-arg NEXT_PUBLIC_API_URL=${env.NEXT_PUBLIC_API_URL} \
//                   --build-arg SPRING_PROFILES_ACTIVE=${env.SPRING_PROFILES_ACTIVE}
//                 """
//                 sh 'docker-compose up -d frontend backend'
//             }
//         }
//     }
//     post {
//         always {
//             echo 'Pipeline finished.'
//         }
//         failure {
//             echo 'Pipeline failed.'
//         }
//     }
// }
