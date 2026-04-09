# =====================================================================
# Dockerfile cho auth-service (multi-stage build)
#
# Stage 1 (build): Maven compile + package JAR
# Stage 2 (runtime): JRE nhỏ gọn, chỉ chạy JAR
#
# Multi-stage giúp image cuối không chứa Maven/JDK, nhỏ hơn ~300MB
# =====================================================================

# ===== STAGE 1: BUILD =====
FROM maven:3.9.6-eclipse-temurin-21 AS builder

WORKDIR /app

# Copy pom.xml trước để cache Maven dependencies
# (Nếu code thay đổi nhưng pom.xml không đổi → không re-download deps)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code và build
COPY src ./src
RUN mvn clean package -DskipTests -B

# ===== STAGE 2: RUNTIME =====
FROM eclipse-temurin:21-jre-alpine

WORKDIR /app

# Tạo user non-root để chạy app (security best practice)
RUN addgroup -S planbook && adduser -S planbook -G planbook
USER planbook

# Copy JAR từ stage 1
COPY --from=builder /app/target/auth-service.jar auth-service.jar

# Expose port
EXPOSE 8081

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD wget -qO- http://localhost:8081/actuator/health || exit 1

# Chạy app với JVM options phù hợp container
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", "auth-service.jar"]
