# Build do frontend
FROM node:lts as frontend-builder
WORKDIR /app
COPY frontend/ .

# Solução para o bug do Rollup:
RUN npm install -g npm@latest && \
    rm -rf node_modules package-lock.json && \
    npm install --force && \
    npm run build

# Build do backend
FROM maven:3.9-eclipse-temurin-23 as backend-builder
WORKDIR /app
COPY backend/ .
COPY --from=frontend-builder /app/dist/ src/main/resources/static/
RUN mvn clean package -DskipTests

# Imagem final
FROM openjdk:23-jdk-slim
WORKDIR /app
COPY --from=backend-builder /app/target/backend-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]