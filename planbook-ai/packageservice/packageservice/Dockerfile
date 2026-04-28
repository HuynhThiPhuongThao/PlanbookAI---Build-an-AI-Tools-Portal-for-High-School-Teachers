# =====================================================================
# Dockerfile - package-service (Spring Boot, Java 17)
# Port: 8087
# Context: packageservice/packageservice/ (thư mục chứa pom.xml)
# =====================================================================

FROM maven:3.9.6-eclipse-temurin-21 AS builder
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B -q
COPY src ./src
RUN mvn clean package -DskipTests -B -q

FROM eclipse-temurin:17-jre-alpine
WORKDIR /app
RUN addgroup -S planbook && adduser -S planbook -G planbook
USER planbook
COPY --from=builder /app/target/package-service-0.0.1-SNAPSHOT.jar package-service.jar
EXPOSE 8087
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8087/api/packages || exit 1
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-jar", "package-service.jar"]
