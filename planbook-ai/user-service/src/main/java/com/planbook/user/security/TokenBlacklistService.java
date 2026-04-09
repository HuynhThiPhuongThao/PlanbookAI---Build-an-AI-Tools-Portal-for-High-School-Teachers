package com.planbook.user.security;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class TokenBlacklistService {

    private final RedisTemplate<String, String> redisTemplate;

    // PREFIX giúp phân biệt với các key Redis khác trong hệ thống
    private static final String TOKEN_PREFIX = "blacklist:token:";   // blacklist token cụ thể (logout)
    private static final String USER_PREFIX  = "blacklist:user:";    // blacklist theo userId (ban)

    // =====================================================================
    // BLACKLIST TOKEN CỤ THỂ — dùng cho LOGOUT
    // TTL = thời gian còn lại của token (đến khi exp)
    // Hết TTL → Redis tự xóa → key biến mất → token không còn bị chặn nữa
    // (nhưng token cũng đã hết hạn rồi nên không dùng được)
    // =====================================================================
    public void blacklistToken(String token, long remainingMillis) {
        String key = TOKEN_PREFIX + token;
        redisTemplate.opsForValue().set(key, "blacklisted", Duration.ofMillis(remainingMillis));
        log.info("Token blacklisted, TTL: {}ms", remainingMillis);
    }

    // =====================================================================
    // BLACKLIST THEO USER ID — dùng cho BAN ACCOUNT
    // Không cần token cụ thể, chỉ cần userId
    // TTL = 24h (bằng thời gian sống của access token)
    // =====================================================================
    public void blacklistUser(Long userId) {
        String key = USER_PREFIX + userId;
        redisTemplate.opsForValue().set(key, "banned", Duration.ofHours(24));
        log.info("User {} blacklisted in Redis", userId);
    }

    // Bỏ blacklist user (khi ADMIN mở lại tài khoản)
    public void removeUserBlacklist(Long userId) {
        redisTemplate.delete(USER_PREFIX + userId);
        log.info("User {} removed from blacklist", userId);
    }

    // =====================================================================
    // CHECK — Dùng trong JwtAuthFilter
    // =====================================================================
    public boolean isTokenBlacklisted(String token) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(TOKEN_PREFIX + token));
    }

    public boolean isUserBlacklisted(Long userId) {
        return Boolean.TRUE.equals(redisTemplate.hasKey(USER_PREFIX + userId));
    }
}
