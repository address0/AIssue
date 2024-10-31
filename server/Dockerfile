# OpenJDK 17 이미지 사용
FROM openjdk:17-jdk

# 작업 디렉토리 설정
WORKDIR /app

# 시스템 패키지 업데이트 및 findutils 설치
RUN apk update && \
    apk add --no-cache \
    findutils \
    coreutils \
    procps


# Gradle Wrapper 복사
COPY gradlew ./
COPY gradle ./gradle

# 소스 코드 복사
COPY . .

# gradlew에 실행 권한 부여
RUN chmod +x gradlew

# 환경 변수 설정
ARG SPRING_PROFILES_ACTIVE
ENV SPRING_PROFILES_ACTIVE=$SPRING_PROFILES_ACTIVE

# 빌드
RUN ./gradlew clean build -x test --no-daemon

# 포트 노출
EXPOSE 8080

# 애플리케이션 시작
CMD ["java", "-jar", "build/libs/app.jar"]
