# Dùng Java 21
FROM eclipse-temurin:21-jdk

# Tạo thư mục app
WORKDIR /app

# Copy file jar vào container
COPY target/question-bank-service.jar app.jar

# Chạy app
ENTRYPOINT ["java","-jar","app.jar"]