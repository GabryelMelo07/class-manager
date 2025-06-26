# Build do frontend
FROM node:22.6.0 as frontend-builder
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

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