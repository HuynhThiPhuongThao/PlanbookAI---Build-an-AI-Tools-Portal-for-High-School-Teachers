package com.planbook.user.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.nio.file.Path;
import java.nio.file.Paths;

/**
 * WebMvcConfig - Cấu hình Spring Boot serve file ảnh tĩnh từ ổ cứng.
 *
 * Ví dụ đời sống: Giống như đặt cái tủ trưng bày ảnh (uploads/) ra cổng nhà.
 * Ai đi ngang cũng vào xem được bằng cách gõ địa chỉ /uploads/avatars/ten_anh.jpg
 *
 * Luồng:
 *   Trình duyệt GET /uploads/avatars/abc.jpg
 *       ↓
 *   Spring MVC map /uploads/** → file:uploads/ trên ổ cứng
 *       ↓
 *   Trả về file ảnh cho trình duyệt hiển thị
 */
@Configuration
public class WebMvcConfig implements WebMvcConfigurer {

    @Value("${app.upload.dir:uploads/avatars}")
    private String uploadDir;

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // Serve file ảnh: GET /uploads/avatars/{filename} → file:uploads/avatars/{filename}
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath();
        String uploadAbsPath = uploadPath.toUri().toString();

        registry.addResourceHandler("/uploads/avatars/**")
                .addResourceLocations(uploadAbsPath + "/");
    }
}
