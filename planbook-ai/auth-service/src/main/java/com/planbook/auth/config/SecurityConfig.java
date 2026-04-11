package com.planbook.auth.config;

import com.planbook.auth.security.JwtAuthFilter;
import com.planbook.auth.security.UserDetailsServiceImpl;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

// =====================================================================
// SECURITYCONFIG – Bảng nội quy của nhà hàng
// =====================================================================
// File này TRẢ LỜI các câu hỏi:
//   • Endpoint nào ai cũng vào được? Endpoint nào cần thẻ?
//   • Mã hóa password bằng gì?
//   • Dùng session hay JWT?
//   • Cho phép domain nào gọi API? (CORS)
//
// TẠI SAO CẦN FILE RIÊNG THAY VÌ VIẾT TRONG CONTROLLER?
// → Vì security là cross-cutting concern – áp dụng cho TẤT CẢ endpoint
// → Viết tập trung 1 chỗ, dễ thay đổi, dễ hiểu
// → Giống nội quy nhà hàng dán ở cổng, không phải mỗi bàn một tờ nội quy
// =====================================================================

@Configuration
// @Configuration → "File này chứa cấu hình, Spring đọc khi khởi động"

@EnableWebSecurity
// @EnableWebSecurity → Bật Spring Security cho project
// TẠI SAO CẦN? Vì Spring Security không tự bật – mày phải enable thủ công

@EnableMethodSecurity
// @EnableMethodSecurity → Cho phép dùng @PreAuthorize trên từng method
// Ví dụ: @PreAuthorize("hasRole('ADMIN')") trên method deleteUser()
// → Bảo vệ ở tầng method, thay vì chỉ bảo vệ theo URL

@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;
    private final UserDetailsServiceImpl userDetailsService;

    // TẠI SAO LÀ ARRAY?
    // → Vì nhiều endpoint public, dùng array để truyền vào requestMatchers()
    // → Dễ thêm bớt endpoint public sau này mà không động vào logic
    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/auth/login", // đăng nhập → không cần token (hiển nhiên)
            "/api/auth/register", // đăng ký → chưa có token (người mới)
            "/api/auth/check-email", // check email tồn tại chưa → public để form check
            "/api/auth/refresh", // refresh token → dùng refresh token thay vì JWT
            "/actuator/**", // health check endpoint (Docker dùng)
            "/swagger-ui/**", // giao diện test API (dev dùng)
            "/swagger-ui.html",
            "/api-docs/**",
            "/v3/api-docs/**"
    };

    // =================================================================
    // @Bean – "Các cài đặt này Spring hãy quản lý và inject cho ai cần"
    // =================================================================
    // TẠI SAO DÙNG @Bean?
    // → @Bean là cách nói với Spring: "Tao tạo ra object này, mày quản lý đi"
    // → Ai cần object đó chỉ cần khai báo trong constructor, Spring tự inject
    // → Giống đặt hàng trước với kho: "Tao cần cái passwordEncoder,
    // kho (Spring) có sẵn rồi, lấy xuống dùng thôi"

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        // HttpSecurity = builder để cấu hình các quy tắc bảo mật
        // Dùng method chaining (gọi .method() liên tiếp) để set từng rule
        // TẠI SAO KHÔNG DÙNG setter thông thường?
        // → Builder pattern đọc dễ hơn khi có nhiều config liên quan nhau

        http
                // BẮT BUỘC TẮT CSRF vì dùng REST API + JWT
                .csrf(csrf -> csrf.disable())

                // CORS – cho phép frontend domain nào gọi API
                // TẠI SAO CẦN CORS?
                // → Trình duyệt chặn JS của trang A gọi API của trang B (same-origin policy)
                // → CORS = "tao (server) cho phép những domain này gọi tao"
                // → Ví dụ: frontend chạy localhost:3000, backend :8081 → khác origin → cần CORS
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                // Quy tắc endpoint nào cần auth
                .authorizeHttpRequests(auth -> auth
                        // PUBLIC_ENDPOINTS → ai cũng vào được, không cần token
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        // Tất cả endpoint còn lại → BẮT BUỘC phải có JWT hợp lệ
                        .anyRequest().authenticated())

                // STATELESS = Không tạo session trên server
                // TẠI SAO STATELESS?
                // → Microservice: nhiều instance server chạy song song
                // → nếu dùng session, user login instance 1, request 2 đến instance 2 → lạc
                // session
                // → JWT: mỗi request tự mang thông tin → không cần server nhớ trạng thái
                // → Giống thẻ nhân viên: mày tự mang thẻ, đến cổng nào cũng vào được
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Kết nối authenticationProvider (cách xác thực)
                .authenticationProvider(authenticationProvider())

                // Thêm JwtAuthFilter VÀO TRƯỚC UsernamePasswordAuthenticationFilter
                // TẠI SAO "BEFORE"?
                // → Vì mày muốn JWT được check trước khi Spring Security làm bất cứ thứ gì
                // → Filter chain hoạt động theo thứ tự, addFilterBefore = chèn vào trước
                // → Giống: bảo vệ của mày (JwtFilter) đứng trước bảo vệ mặc định của Spring
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        // DaoAuthenticationProvider = cách xác thực bằng DB (Dao = Data Access Object)
        // TẠI SAO CẦN CÁI NÀY?
        // → Spring Security cần biết: "Khi xác thực, lấy user từ đâu và so sánh
        // password thế nào?"
        // → DaoAuthenticationProvider trả lời: "Lấy từ DB qua userDetailsService,
        // so sánh bằng passwordEncoder"
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService); // lấy user từ DB
        provider.setPasswordEncoder(passwordEncoder()); // so sánh password bằng BCrypt
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        // AuthenticationManager = người điều phối việc xác thực
        // AuthService.login() gọi authenticationManager.authenticate()
        // → authManager gọi authenticationProvider
        // → provider load user từ DB + compare password
        // → Thành công: trả UserDetails | Thất bại: throw BadCredentialsException
        return config.getAuthenticationManager();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt = thuật toán hash password industry standard
        // TẠI SAO BCRYPT mà không phải MD5 hay SHA?
        // → BCrypt tự thêm "salt" ngẫu nhiên → cùng password hash ra khác nhau mỗi lần
        // → MD5/SHA: "abc123" luôn hash thành cùng 1 chuỗi → dễ bị rainbow table attack
        // → BCrypt: "abc123" lần 1: $2a$10$abc..., lần 2: $2a$10$xyz... → không crack
        // được
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();

        // Cho phép tất cả origin (domain)
        // PRODUCTION: thay bằng domain thật ["https://planbook.ai"]
        config.setAllowedOriginPatterns(List.of("*"));

        // Cho phép các HTTP method này
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        // OPTIONS → browser tự gửi "preflight request" để hỏi server trước
        // phải allow OPTIONS nếu không CORS sẽ fail

        config.setAllowedHeaders(List.of("*")); // Cho phép mọi header
        config.setAllowCredentials(true); // Cho phép gửi cookie/auth header

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config); // Áp dụng cho TẤT CẢ URL
        return source;
    }
}
