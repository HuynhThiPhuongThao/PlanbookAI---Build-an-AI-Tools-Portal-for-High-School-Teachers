package com.planbook.auth.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

// =====================================================================
// JWTSERVICE – Người thợ in thẻ nhân viên
// =====================================================================
// JWT (JSON Web Token) là một chuỗi mã hóa trông như này:
//   eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0QGdtYWlsLmNvbSJ9.xxxxx
//   |______ Header ______|.____ Payload (data) ____|._ Signature _|
//
// Payload chứa: email (sub), role, userId, thời gian hết hạn (exp)
// Signature: chữ ký số - dùng để xác minh token không bị giả mạo
//
// ÁNH DỤNG CUỘC SỐNG:
//   JWT giống thẻ ATM
//   - Có thông tin (tên, số tài khoản) được mã hóa
//   - Ngân hàng (server) in ra, mày giữ và mang theo
//   - Mỗi lần thanh toán, máy ATM đọc thẻ mà không cần gọi về ngân hàng hỏi lại
//   - Thẻ hết hạn → ra ngân hàng làm thẻ mới (refresh token)
// =====================================================================

@Service
@Slf4j
public class JwtService {

    // Đọc giá trị từ application.yml, không hardcode trong code
    // TẠI SAO: Nếu hardcode, khi deploy production phải sửa code → nguy hiểm
    @Value("${jwt.secret}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;  // milliseconds, mặc định 86400000 = 24 giờ

    // =================================================================
    // GENERATE TOKEN – In thẻ nhân viên
    // =================================================================
    // Tại sao truyền vào userId và role?
    // → Để nhúng vào trong thẻ luôn, các service khác đọc thẻ biết ngay
    //   là ai, quyền gì – không cần gọi thêm database nữa
    public String generateToken(UserDetails userDetails, Long userId, String role) {

        // extraClaims = thông tin thêm muốn nhúng vào thẻ
        // TẠI SAO DÙNG Map? Vì Claims trong JWT là cặp key-value, Map phù hợp nhất
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", role);       // "TEACHER", "ADMIN", v.v.
        extraClaims.put("userId", userId);   // để frontend biết đang login là ai

        return buildToken(extraClaims, userDetails, jwtExpiration);
    }

    // =================================================================
    // IS TOKEN VALID – Bảo vệ quét thẻ: thẻ có hợp lệ không?
    // =================================================================
    // Kiểm tra 2 thứ:
    //   1. username trong thẻ có khớp với user đang request?
    //   2. Thẻ chưa hết hạn?
    //
    // TẠI SAO KHÔNG CHỈ CHECK CHỮ KÝ?
    // → Vì user có thể bị xóa hoặc đổi email sau khi login
    //   → phải verify lại username
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return username.equals(userDetails.getUsername()) && !isTokenExpired(token);
    }

    // =================================================================
    // EXTRACT METHODS – Đọc thông tin từ thẻ
    // =================================================================
    // TẠI SAO DÙNG FUNCTION<Claims, T>?
    // → Đây là Java generics + functional interface
    // → Giống truyền "cách lấy gì" vào thay vì viết 3 hàm riêng biệt
    //
    // Ví dụ dễ hiểu hơn:
    //   extractClaim(token, claims -> claims.getSubject())   → lấy email
    //   extractClaim(token, claims -> claims.get("role"))    → lấy role
    //   Chỉ 1 hàm extractClaim, truyền vào CÁCH lấy gì → dùng được cho mọi field
    //   Giống như: "Anh ơi vào kho lấy giúp em [cái này]" – "cái này" là tham số

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);  // getSubject() = email (sub field)
    }

    public String extractRole(String token) {
        return extractClaim(token, claims -> claims.get("role", String.class));
    }

    public Long extractUserId(String token) {
        return extractClaim(token, claims -> claims.get("userId", Long.class));
    }

    // =================================================================
    // PRIVATE HELPERS – Nội bộ, bên ngoài không gọi được
    // =================================================================

    private String buildToken(Map<String, Object> extraClaims, UserDetails userDetails, long expiration) {
        // Jwts.builder() = bắt đầu "in thẻ"
        // TẠI SAO DÙNG BUILDER PATTERN?
        // → Vì JWT có nhiều fields, builder giúp set từng field rõ ràng
        //   thay vì constructor 10 tham số nhìn rối loạn
        return Jwts.builder()
                .claims(extraClaims)                                          // thêm role, userId vào thẻ
                .subject(userDetails.getUsername())                           // email = "chủ thẻ"
                .issuedAt(new Date(System.currentTimeMillis()))               // in lúc mấy giờ
                .expiration(new Date(System.currentTimeMillis() + expiration))// hết hạn lúc nào
                .signWith(getSigningKey())                                     // ký tên = chống giả mạo
                .compact();                                                   // xuất ra String
    }

    private boolean isTokenExpired(String token) {
        // Lấy thời gian hết hạn trong thẻ, so với giờ hiện tại
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    // Generic method dùng chung để extract bất kỳ field nào từ token
    // T là kiểu dữ liệu generic – có thể là String, Date, Long, ...
    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);  // apply = "gọi cái function mày truyền vào"
    }

    private Claims extractAllClaims(String token) {
        // Parse (giải mã) token, verify chữ ký
        // Nếu token bị giả mạo hoặc hết hạn → throw exception
        return Jwts.parser()
                .verifyWith(getSigningKey())  // dùng key để verify chữ ký
                .build()
                .parseSignedClaims(token)    // giải mã
                .getPayload();               // lấy phần data
    }

    private SecretKey getSigningKey() {
        // Chuyển chuỗi secret (từ application.yml) thành SecretKey để ký JWT
        // TẠI SAO PHẢI convert?
        // → JJWT v0.12+ yêu cầu kiểu SecretKey, không nhận raw String nữa
        //   → bảo mật hơn vì tránh dùng key yếu
        byte[] keyBytes = secretKey.getBytes(StandardCharsets.UTF_8);
        return Keys.hmacShaKeyFor(keyBytes);
        // HMAC-SHA = thuật toán ký số, industry standard cho JWT
    }
}
