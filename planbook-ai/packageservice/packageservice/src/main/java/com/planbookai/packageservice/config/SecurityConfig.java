package com.planbookai.packageservice.config;

import java.io.IOException;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity   // kích hoạt @PreAuthorize
public class SecurityConfig {

    /**
     * Filter đọc header X-User-Id và X-Roles mà api-gateway đã forward vào.
     * Service này KHÔNG tự verify JWT – gateway đã làm điều đó rồi.
     * Filter này chỉ build SecurityContext để @PreAuthorize hoạt động.
     */
    @Bean
    public OncePerRequestFilter gatewayHeaderAuthFilter() {
        return new OncePerRequestFilter() {
            @Override
            protected void doFilterInternal(HttpServletRequest request,
                                            HttpServletResponse response,
                                            FilterChain filterChain)
                    throws ServletException, IOException {

                String userId    = request.getHeader("X-User-Id");
                String rolesHeader = request.getHeader("X-Role");

                if (userId != null && rolesHeader != null && !rolesHeader.isBlank()) {
                    List<SimpleGrantedAuthority> authorities = Arrays.stream(rolesHeader.split(","))
                            .map(String::trim)
                            .filter(r -> !r.isEmpty())
                            // Gateway forward "TEACHER", Spring Security cần "ROLE_TEACHER"
                            .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                            .collect(Collectors.toList());

                    UsernamePasswordAuthenticationToken auth =
                            new UsernamePasswordAuthenticationToken(userId, null, authorities);
                    SecurityContextHolder.getContext().setAuthentication(auth);
                }

                filterChain.doFilter(request, response);
            }
        };
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // GET /api/packages – public (không có header X-Roles)
                .requestMatchers(HttpMethod.GET, "/api/packages").permitAll()
                // Tất cả còn lại phải authenticated; role check dùng @PreAuthorize
                .anyRequest().authenticated()
            )
            .addFilterBefore(gatewayHeaderAuthFilter(), UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}