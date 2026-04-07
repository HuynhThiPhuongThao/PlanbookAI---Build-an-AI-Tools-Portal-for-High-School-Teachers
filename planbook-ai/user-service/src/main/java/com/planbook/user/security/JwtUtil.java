package com.planbook.user.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;

// @Service → Spring quản lý class này, có thể inject vào JwtAuthFilter
@Service
public class JwtUtil {

    // Đọc giá trị jwt.secret từ application.yml
    // Phải GIỐNG HỆT secret trong auth-service → mới verify được token
    @Value("${jwt.secret}")
    private String secretKey;

    // Lấy toàn bộ thông tin trong token (claims = payload của JWT)
    public Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())  // dùng secret key để verify chữ ký
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // Lấy userId từ token (auth-service đã nhét vào khi tạo token)
    public Long extractUserId(String token) {
        return extractAllClaims(token).get("userId", Long.class);
    }

    // Lấy email (subject của JWT)
    public String extractEmail(String token) {
        return extractAllClaims(token).getSubject();
    }

    // Lấy role từ token
    public String extractRole(String token) {
        return extractAllClaims(token).get("role", String.class);
    }

    // Kiểm tra token có hợp lệ không (chữ ký đúng + chưa hết hạn)
    public boolean isTokenValid(String token) {
        try {
            extractAllClaims(token); // nếu không throw exception → hợp lệ
            return true;
        } catch (Exception e) {
            return false; // hết hạn hoặc bị giả mạo
        }
    }

    // Tạo key từ chuỗi secret để ký/verify JWT
    private SecretKey getSigningKey() {
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
//Chức năng: CHỈ đọc JWT token, không tạo token mới. Auth-service mới tạo token, 
// user-service chỉ đọc để biết "người này là ai, role gì".