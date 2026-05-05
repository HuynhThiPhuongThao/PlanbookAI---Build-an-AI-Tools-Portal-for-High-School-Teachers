package com.planbook.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Map;
import java.util.Objects;

@Service
public class FirebaseNotificationService {

    public static final String TYPE_CONTENT_SUBMITTED = "CONTENT_SUBMITTED";
    public static final String TYPE_CONTENT_APPROVED = "CONTENT_APPROVED";
    public static final String TYPE_CONTENT_REJECTED = "CONTENT_REJECTED";
    public static final String TYPE_SYSTEM_CONFIG_UPDATED = "SYSTEM_CONFIG_UPDATED";

    public void sendNotification(String targetToken, String title, String body) {
        sendNotification(targetToken, title, body, "GENERAL", Map.of());
    }

    public void sendNotification(String targetToken, String title, String body, String type, Map<String, String> data) {
        if (targetToken == null || targetToken.trim().isEmpty()) {
            return;
        }

        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message.Builder messageBuilder = Message.builder()
                    .setToken(targetToken.trim())
                    .setNotification(notification)
                    .putData("type", type == null || type.isBlank() ? "GENERAL" : type)
                    .putData("source", "curriculum-service");

            if (data != null) {
                data.forEach((key, value) -> {
                    if (key != null && value != null) {
                        messageBuilder.putData(key, value);
                    }
                });
            }

            String response = FirebaseMessaging.getInstance().send(messageBuilder.build());
            System.out.println("[Firebase FCM] Notification sent: " + response);
        } catch (Exception e) {
            System.err.println("[Firebase FCM] Send failed: " + e.getMessage());
        }
    }

    public void sendNotificationToMany(Collection<String> targetTokens, String title, String body) {
        sendNotificationToMany(targetTokens, title, body, "GENERAL", Map.of());
    }

    public void sendNotificationToMany(Collection<String> targetTokens, String title, String body, String type, Map<String, String> data) {
        if (targetTokens == null || targetTokens.isEmpty()) {
            System.out.println("[Firebase FCM] No recipient token.");
            return;
        }

        targetTokens.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(token -> !token.isEmpty())
                .distinct()
                .forEach(token -> sendNotification(token, title, body, type, data));
    }
}
