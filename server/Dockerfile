# OpenJDK 17 이미지 사용
FROM openjdk:17-jdk

# 작업 디렉토리 설정
WORKDIR /app

# Gradle Wrapper 복사
COPY gradlew ./
COPY gradle ./gradle

# 소스 코드 복사
COPY . .

# 환경 변수 설정
ARG SPRING_PROFILES_ACTIVE
ENV SPRING_PROFILES_ACTIVE=$SPRING_PROFILES_ACTIVE

# 빌드
RUN ./gradlew clean build -x test --no-daemon

# 포트 노출
EXPOSE 8080

# 애플리케이션 시작
CMD ["java", "-jar", "build/libs/your-app.jar"]
