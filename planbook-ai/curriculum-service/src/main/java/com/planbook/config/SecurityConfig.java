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
                        //.requestMatchers("/api/subjects/**").hasAnyRole("TEACHER", "STAFF")
                        .requestMatchers("/api/subjects/**").permitAll() // tạm thời mở cho dễ test, sau này sẽ sửa lại
                        //.requestMatchers("/api/chapters/**").hasAnyRole("TEACHER", "STAFF")
                        .requestMatchers("/api/chapters/**").permitAll() // tạm thời mở cho dễ test, sau này sẽ sửa lại
                        //.requestMatchers("/api/topics/**").hasAnyRole("TEACHER", "STAFF")
                        .requestMatchers("/api/topics/**").permitAll() // tạm thời mở cho dễ test, sau này sẽ sửa lại

                        
                        // admin CRUD curriculum templates
                        .requestMatchers(HttpMethod.POST, "/api/curriculum-templates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/curriculum-templates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/curriculum-templates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.GET, "/api/curriculum-templates/**").hasAnyRole("ADMIN", "STAFF", "TEACHER")
                        //.requestMatchers("/api/curriculum-templates/**").permitAll()// tạm thời mở cho dễ test, sau này sẽ sửa lại

                        // staff CRUD sample lesson plans
                        .requestMatchers("/api/sample-lesson-plans/**").hasAnyRole("STAFF")
                        //.requestMatchers("/api/sample-lesson-plans/**").permitAll() // tạm thời mở cho dễ test, sau này sẽ sửa lại

                        // manager review sample lesson plans
                        .requestMatchers("/api/sample-lesson-plans/review/**").hasAnyRole("MANAGER")
                        //.requestMatchers("/api/sample-lesson-plans/review/**").permitAll() // tạm thời mở cho dễ test, sau này sẽ sửa lại 
                        
                        // xem sample lesson plan đã duyệt
                        .requestMatchers(HttpMethod.GET,"/api/sample-lesson-plans/approved/**").hasAnyRole("TEACHER", "STAFF", "MANAGER", "ADMIN")
                        //.requestMatchers("/api/sample-lesson-plans/approved/**").permitAll() // tạm thời mở cho dễ test, sau này sẽ sửa lại

                        // lesson plan chỉ teacher mới dùng
                        .requestMatchers("/api/lesson-plans/**").hasRole("TEACHER")
                        //.requestMatchers("/api/lesson-plans/**").permitAll() // tạm thời mở cho dễ test, sau này sẽ sửa lại

                        // các request còn lại phải login
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}