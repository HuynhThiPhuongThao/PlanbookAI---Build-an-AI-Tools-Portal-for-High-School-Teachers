package com.planbook.user.security;

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

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

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

            if (jwtUtil.isTokenValid(jwt)) {
                Long userId = jwtUtil.extractUserId(jwt);
                String role = jwtUtil.extractRole(jwt);

                // Lưu userId vào request → Controller đọc bằng @RequestAttribute
                request.setAttribute("userId", userId);

                // Báo cho Spring Security biết: "user này đã xác thực, role là gì"
                UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                        userId,
                        null,
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                    );
                SecurityContextHolder.getContext().setAuthentication(authentication);
            }
        } catch (Exception e) {
            // Token lỗi → không set authentication → Spring Security chặn lại
        }

        filterChain.doFilter(request, response);
    }
}
// Chức năng: "Bảo vệ cổng" – chặn TỪNG request, kiểm tra token trước khi cho vào Controller.