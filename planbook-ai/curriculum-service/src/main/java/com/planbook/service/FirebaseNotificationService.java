package com.planbook.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FirebaseNotificationService {

    // Hàm gửi tin nhắn notification chung
    public void sendNotification(String targetToken, String title, String body) {
        try {
            // Đóng gói nội dung thông báo
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            // Đóng gói địa chỉ gửi tới (targetToken)
            Message message = Message.builder()
                    .setToken(targetToken)
                    .setNotification(notification)
                    .build();

            // Giao cho Firebase xử lý
            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("🔥 [Firebase FCM] Thông báo thành công: " + response);
        } catch (Exception e) {
            System.err.println("❌ [Firebase FCM] Lỗi khi gửi thông báo: " + e.getMessage());
            // e.printStackTrace();
        }
    }
}
