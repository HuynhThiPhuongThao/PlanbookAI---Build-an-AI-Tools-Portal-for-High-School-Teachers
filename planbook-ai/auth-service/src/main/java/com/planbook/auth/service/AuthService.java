package com.planbook.auth.service;

import com.planbook.auth.dto.AuthResponse;
import com.planbook.auth.dto.LoginRequest;
import com.planbook.auth.dto.RegisterRequest;
import com.planbook.auth.dto.CreateAccountRequest;
import com.planbook.auth.entity.RefreshToken;
import com.planbook.auth.entity.Role;
import com.planbook.auth.entity.User;
import com.planbook.auth.repository.RefreshTokenRepository;
import com.planbook.auth.repository.UserRepository;
import com.planbook.auth.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

/**
 * AuthService - Business logic cho authentication.
 *
 * Các method:
 * - register(): tạo user mới (role TEACHER mặc định)
 * - login(): authenticate + issue JWT pair (access + refresh)
 * - refresh(): dùng refresh token để lấy access token mới
 * - logout(): xóa refresh token khỏi DB
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    private final RestTemplate restTemplate;

    // URL của user-service trong Docker network (bypass Gateway)
    @Value("${user-service.internal-url:http://user-service:8082}")
    private String userServiceUrl;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    // ===== REGISTER =====

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(Role.TEACHER) // Mặc định tất cả user tự đăng ký là TEACHER
                .build();

        user = userRepository.save(user);
        log.info("Registered new user: {}", user.getEmail());

        return generateAuthResponse(user);
    }

    // ===== ĐỂ ADMIN TẠO ACCOUNT =====
    @Transactional
    public AuthResponse createInternalAccount(CreateAccountRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email đã tồn tại hoặc bị giang hồ lụm: " + request.getEmail());
        }

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .fullName(request.getFullName())
                .role(request.getRole()) // Lấy từ body thay vì query param
                .build();

        user = userRepository.save(user);
        log.info("Admin created new internal account: {} with role: {}", user.getEmail(), request.getRole());

        // Đồng bộ profile sang user-service (qua Docker internal network)
        // Nếu gọi thất bại (user-service tạm thời down) thì chỉ log warn, KHÔNG rollback
        // User vẫn login được và profile sẽ được tạo lazy khi login lần đầu
        try {
            Map<String, Object> profilePayload = Map.of(
                    "userId",   user.getId(),
                    "email",    user.getEmail(),
                    "fullName", user.getFullName(),
                    "role",     user.getRole().name()
            );
            String initUrl = userServiceUrl + "/api/users/internal/init-profile";
            restTemplate.postForEntity(initUrl, profilePayload, String.class);
            log.info("Profile đã được init cho userId={}", user.getId());
        } catch (Exception e) {
            log.warn("Không thể init profile cho userId={}: {}. User vẫn login được bình thưẝng.", user.getId(), e.getMessage());
        }

        return generateAuthResponse(user);
    }

    // ===== LOGIN =====

    @Transactional
    public AuthResponse login(LoginRequest request) {
        // Spring Security authenticate: kiểm tra email + password, throw nếu sai
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        return generateAuthResponse(user);
    }

    // ===== REFRESH TOKEN =====

    @Transactional
    public AuthResponse refreshToken(String refreshTokenStr) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(refreshTokenStr)
                .orElseThrow(() -> new RuntimeException("Refresh token không hợp lệ"));

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new RuntimeException("Refresh token đã hết hạn, vui lòng đăng nhập lại");
        }

        User user = userRepository.findById(refreshToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Xóa refresh token cũ, tạo mới (rotation để bảo mật)
        refreshTokenRepository.delete(refreshToken);

        return generateAuthResponse(user);
    }

    // ===== CHECK EMAIL EXISTS (for real-time validation) =====

    public boolean checkEmailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    // ===== LOGOUT =====

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
        log.info("User {} logged out", userId);
    }

    // ===== PRIVATE HELPERS =====

    private AuthResponse generateAuthResponse(User user) {
        String accessToken = jwtService.generateToken(user, user.getId(), user.getRole().name());
        String refreshToken = createRefreshToken(user.getId());

        return AuthResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(jwtExpiration)
                .userId(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    private String createRefreshToken(Long userId) {
        // Xóa refresh token cũ nếu có
        refreshTokenRepository.deleteByUserId(userId);

        RefreshToken refreshToken = RefreshToken.builder()
                .userId(userId)
                .token(UUID.randomUUID().toString()) // Random UUID làm refresh token
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build();

        return refreshTokenRepository.save(refreshToken).getToken();
    }

    // ===== ĐỔI MẬT KHẨU =====
    @Transactional
    public void changePassword(Long userId, String currentPassword, String newPassword) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User không tồn tại"));

        // Kiểm tra mật khẩu cũ có đúng không
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Mật khẩu hiện tại không đúng");
        }

        // Encode mật khẩu mới và lưu
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        log.info("User {} đã đổi mật khẩu thành công", userId);
    }
}
