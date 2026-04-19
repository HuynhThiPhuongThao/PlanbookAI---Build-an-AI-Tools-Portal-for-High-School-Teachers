package com.planbook.config;

import com.planbook.security.JwtAuthFilter;
import com.planbook.security.JwtUtil;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.http.HttpMethod;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

@Bean
    public JwtAuthFilter jwtAuthFilter(JwtUtil jwtUtil) {
    return new JwtAuthFilter(jwtUtil);
    }


    //private final JwtAuthFilter jwtAuthFilter;

    //public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        //this.jwtAuthFilter = jwtAuthFilter;
    //}

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, JwtAuthFilter jwtAuthFilter) throws Exception {
        //System.out.println(">>>SecurityConfig cua curriculum-service da duoc loai");
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

                        
                        // admin CRUD curriculum templates
                        .requestMatchers(HttpMethod.POST, "/api/curriculum-templates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/curriculum-templates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/curriculum-templates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/curriculum-templates/**").hasAnyRole("ADMIN", "STAFF", "TEACHER")
                        
 

                        // lesson plan chỉ teacher mới dùng
                        .requestMatchers("/api/lesson-plans/**").hasRole("TEACHER")

                        // các request còn lại phải login
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}