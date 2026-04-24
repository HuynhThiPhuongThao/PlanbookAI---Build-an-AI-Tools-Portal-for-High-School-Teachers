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
                java.io.InputStream serviceAccountStream;
                
                // Môi trường Docker: ưu tiên đọc từ volume mounted vào /app/secrets/
                java.io.File secretFile = new java.io.File("/app/secrets/firebase-adminsdk.json");
                if (secretFile.exists()) {
                    System.out.println("🔥 Đang nạp Firebase config từ file secrets (Volume Mount)...");
                    serviceAccountStream = new java.io.FileInputStream(secretFile);
                } else {
                    // Môi trường dev (Local): nạp từ thư mục resources
                    System.out.println("🔥 Không thấy thư mục secrets, đang nạp từ resources (Local)...");
                    ClassPathResource resource = new ClassPathResource("planbootai-firebase-adminsdk-fbsvc-3837193fcb.json");
                    serviceAccountStream = resource.getInputStream();
                }
                
                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
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
