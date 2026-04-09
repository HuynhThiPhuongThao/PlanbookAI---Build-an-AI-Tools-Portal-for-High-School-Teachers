# =====================================================================
# Dockerfile cho api-gateway (multi-stage build)
# Build context: ./api-gateway/ (từ docker-compose)
# Source thật ở:  ./api-gateway/api-gateway/src/
# =====================================================================

# ===== STAGE 1: BUILD =====
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Source thật nằm trong thư mục con api-gateway/
COPY api-gateway/pom.xml .
RUN mvn dependency:go-offline -B

COPY api-gateway/src ./src
RUN mvn clean package -DskipTests -B

# ===== STAGE 2: RUNTIME =====
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

RUN addgroup -S planbook && adduser -S planbook -G planbook
USER planbook

COPY --from=builder /app/target/*.jar app.jar

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", "app.jar"]

