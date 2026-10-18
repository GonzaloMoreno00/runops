# Build Angular
FROM node:26.0.0-bookworm-slim AS frontend-build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install --global npm@11.12.1
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Build Spring with the Angular files included
FROM eclipse-temurin:21-jdk-jammy AS backend-build
WORKDIR /app/backend
COPY backend/ ./
RUN chmod +x mvnw
COPY --from=frontend-build /app/frontend/dist/frontend/browser/ ./src/main/resources/static/
RUN ./mvnw --batch-mode --no-transfer-progress package -DskipTests

# Run the packaged application
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app
RUN groupadd --system runops \
    && useradd --system --gid runops runops
COPY --from=backend-build /app/backend/target/*.jar ./app.jar
USER runops
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
