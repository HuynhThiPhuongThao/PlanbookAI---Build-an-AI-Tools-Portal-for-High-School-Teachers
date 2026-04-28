package com.planbook.user.security;

import com.planbook.user.repository.UserProfileRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

// OncePerRequestFilter = chạy đúng 1 lần cho mỗi request
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final TokenBlacklistService tokenBlacklistService;
    private final UserProfileRepository userProfileRepository;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        // Đọc header "Authorization: Bearer <token>"
        String authHeader = request.getHeader("Authorization");

        // Không có token → cho đi tiếp (SecurityConfig sẽ từ chối nếu cần auth)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // Cắt bỏ "Bearer " lấy token thật
            String jwt = authHeader.substring(7);

            if (tokenBlacklistService.isTokenBlacklisted(jwt)) {
                response.setStatus(HttpServletResponse.SC_UNAUTHORIZED); // 401
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write("{\"error\":\"TOKEN_REVOKED\",\"message\":\"Token đã bị thu hồi\"}");
                return; // Dừng lại, không cho đi tiếp!
            }

            if (jwtUtil.isTokenValid(jwt)) {
                Long userId = jwtUtil.extractUserId(jwt);
                String role = jwtUtil.extractRole(jwt);
                String email = jwtUtil.extractEmail(jwt);
                String fullName = jwtUtil.extractFullName(jwt);

                boolean lockedInRedis = tokenBlacklistService.isUserBlacklisted(userId);
                boolean lockedInDatabase = userProfileRepository.findById(userId)
                        .map(profile -> !profile.isActive())
                        .orElse(false);
                if (lockedInRedis || lockedInDatabase) {
                    response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                    response.setContentType("application/json;charset=UTF-8");
                    response.getWriter().write("{\"error\":\"ACCOUNT_LOCKED\",\"message\":\"Tài khoản đã bị khóa\"}");
                    return;
                }
                // Lưu metadata vào request → Controller/Service dùng để Lazy Create Profile
                request.setAttribute("userId", userId);
                request.setAttribute("role", role);
                request.setAttribute("email", email);
                request.setAttribute("fullName", fullName);

                // Báo cho Spring Security biết: "user này đã xác thực, role là gì"
                UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role)));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Token lỗi → không set authentication → Spring Security chặn lại
        }

        filterChain.doFilter(request, response);
    }
}
// Chức năng: "Bảo vệ cổng" – chặn TỪNG request, kiểm tra token trước khi cho
// vào Controller.
