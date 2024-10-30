# Frontend Dockerfile (client/Dockerfile)

# 1. 빌드 스테이지
FROM node:18 AS build
WORKDIR /app
COPY aissue/package.json aissue/package-lock.json ./
RUN npm install
COPY aissue ./
RUN npm run build

# 2. 실행 스테이지 (Nginx)
FROM nginx:alpine
COPY --from=build /app/.next /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
