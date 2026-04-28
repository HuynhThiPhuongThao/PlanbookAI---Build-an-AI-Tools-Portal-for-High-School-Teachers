package com.planbook.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import jakarta.annotation.PostConstruct;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.io.ClassPathResource;

import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Configuration
public class FirebaseConfig {

    @Value("${FIREBASE_SERVICE_ACCOUNT_BASE64:}")
    private String serviceAccountBase64;

    @Value("${FIREBASE_SERVICE_ACCOUNT_JSON:}")
    private String serviceAccountJson;

    @PostConstruct
    public void initialize() {
        try {
            if (!FirebaseApp.getApps().isEmpty()) {
                return;
            }

            FirebaseOptions options;
            try (InputStream serviceAccountStream = openServiceAccountStream()) {
                options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccountStream))
                        .build();
            }

            FirebaseApp.initializeApp(options);
            System.out.println("[Firebase] Admin SDK initialized successfully.");
        } catch (Exception e) {
            System.err.println("[Firebase] Admin SDK configuration error: " + e.getMessage());
        }
    }

    private InputStream openServiceAccountStream() throws Exception {
        if (serviceAccountBase64 != null && !serviceAccountBase64.isBlank()) {
            System.out.println("[Firebase] Loading service account from FIREBASE_SERVICE_ACCOUNT_BASE64.");
            byte[] decoded = Base64.getDecoder().decode(serviceAccountBase64.trim());
            return new ByteArrayInputStream(decoded);
        }

        if (serviceAccountJson != null && !serviceAccountJson.isBlank()) {
            System.out.println("[Firebase] Loading service account from FIREBASE_SERVICE_ACCOUNT_JSON.");
            return new ByteArrayInputStream(serviceAccountJson.getBytes(StandardCharsets.UTF_8));
        }

        File secretFile = new File("/app/secrets/firebase-adminsdk.json");
        if (secretFile.exists()) {
            System.out.println("[Firebase] Loading service account from /app/secrets/firebase-adminsdk.json.");
            return new FileInputStream(secretFile);
        }

        System.out.println("[Firebase] Loading service account from classpath fallback.");
        ClassPathResource resource = new ClassPathResource("planbootai-firebase-adminsdk.json");
        return resource.getInputStream();
    }
}
