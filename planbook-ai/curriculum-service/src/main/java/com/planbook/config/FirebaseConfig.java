package com.planbook.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import jakarta.annotation.PostConstruct;

@Configuration
public class FirebaseConfig {
    
    // @PostConstruct: Chạy 1 lần duy nhất lúc khởi động app.
    @PostConstruct
    public void initialize() {
        try {
            // Kiểm tra xem đã khởi tạo chưa (tránh lỗi tạo 2 lần)
            if (FirebaseApp.getApps().isEmpty()) {
                // ClassPathResource sẽ tự mò vào thư mục resources
                ClassPathResource resource = new ClassPathResource("planbootai-firebase-adminsdk-fbsvc-3837193fcb.json");
                
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(resource.getInputStream()))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("🔥 Tích hợp Firebase Admin SDK thành công!");
            }
        } catch (Exception e) {
            System.err.println("❌ Lỗi cấu hình Firebase Admin SDK: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
