package com.planbook.config;

import com.planbook.security.JwtAuthFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )
                .authorizeHttpRequests(auth -> auth
                        // cho swagger mở
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                        // curriculum-service
                        .requestMatchers("/api/subjects/**").hasAnyRole("TEACHER", "STAFF")
                        .requestMatchers("/api/chapters/**").hasAnyRole("TEACHER", "STAFF")
                        .requestMatchers("/api/topics/**").hasAnyRole("TEACHER", "STAFF")

                        // lesson plan chỉ teacher mới dùng
                        .requestMatchers("/api/lesson-plans/**").hasRole("TEACHER")

                        // các request còn lại phải login
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}