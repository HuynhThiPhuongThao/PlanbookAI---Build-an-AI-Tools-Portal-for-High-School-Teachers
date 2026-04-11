package com.planbook.user.config;

import com.planbook.user.security.JwtAuthFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

// @Configuration = class này chứa cấu hình Spring
// @EnableWebSecurity = bật Spring Security
// @EnableMethodSecurity = cho phép dùng @PreAuthorize trên từng method
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean // Spring quản lý và dùng object này làm SecurityFilterChain
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                // Tắt CSRF vì dùng JWT (không dùng cookie/session)
                .csrf(AbstractHttpConfigurer::disable)

                .authorizeHttpRequests(auth -> auth
                        // Các endpoint này mở cho tất cả, không cần token
                        .requestMatchers(
                                "/actuator/**",
                                "/swagger-ui.html",
                                "/swagger-ui/**",
                                "/v3/api-docs/**",
                                "/api-docs/**", // custom path từ application.yml
                                "/webjars/**")
                        .permitAll()
                        // Cho phép CORS Preflight Requests đi qua mà không cần token
                        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
                        // Còn lại đều phải có token hợp lệ
                        .anyRequest().authenticated())

                // Không dùng Session – mỗi request tự mang token (stateless)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Thêm JwtAuthFilter TRƯỚC filter mặc định của Spring
                // Thứ tự: JwtAuthFilter → UsernamePasswordAuthenticationFilter → Controller
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
// Chức năng: Bản nội quy tòa nhà – quy định ai được vào đâu, cổng nào mở cho
// tất cả, cổng nào cần thẻ.