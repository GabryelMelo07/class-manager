# Etapa 1: Build do frontend
FROM node:22.6.0 as frontend-builder
WORKDIR /app
COPY frontend/ .
RUN npm install && npm run build

# Etapa 2: Build do backend
FROM maven:3.9-eclipse-temurin-17 as backend-builder
WORKDIR /app
COPY backend/ .
COPY --from=frontend-builder /app/dist/ src/main/resources/static/
RUN mvn clean package -DskipTests

# Etapa 3: Imagem final
FROM openjdk:23-jdk-slim
WORKDIR /app
COPY --from=backend-builder /app/target/*.jar app.jar

# Cria o diretório onde o usuário pode montar o JSON
RUN mkdir /config
VOLUME /config

# Expõe a porta do backend
EXPOSE 8080

# Variável opcional para definir o caminho do JSON
ENV CONFIG_PATH=/config/public_config.json

ENTRYPOINT ["java", "-jar", "app.jar"]
