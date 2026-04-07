# ===== Stage 1: Build =====
FROM eclipse-temurin:21-jdk-alpine AS builder
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN apk add --no-cache maven && mvn package -DskipTests

# ===== Stage 2: Runtime =====
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
RUN addgroup -S planbook && adduser -S planbook -G planbook
COPY --from=builder /app/target/user-service.jar app.jar
USER planbook
EXPOSE 8082
ENTRYPOINT ["java", "-jar", "app.jar"]
