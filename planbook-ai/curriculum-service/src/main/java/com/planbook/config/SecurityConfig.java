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

                        // subject, chapter, topic: các actor nghiệp vụ đều có thể xem
                        .requestMatchers("/api/subjects/**").hasAnyRole("ADMIN", "STAFF", "MANAGER", "TEACHER")
                        .requestMatchers("/api/chapters/**").hasAnyRole("ADMIN", "STAFF", "MANAGER", "TEACHER")
                        .requestMatchers("/api/topics/**").hasAnyRole("ADMIN", "STAFF", "MANAGER", "TEACHER")

                        // manager review sample lesson plans
                        .requestMatchers("/api/sample-lesson-plans/review/**").hasAnyRole("MANAGER")

                        //teacher/staff/manager/admin xem sample đã approved
                        .requestMatchers(HttpMethod.GET, "/api/sample-lesson-plans/approved/**").hasAnyRole("ADMIN", "STAFF", "MANAGER", "TEACHER")

                        //staff CRUD sample lesson plans
                        .requestMatchers(HttpMethod.POST, "/api/sample-lesson-plans").hasRole("STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/sample-lesson-plans/my").hasRole("STAFF")
                        .requestMatchers(HttpMethod.GET, "/api/sample-lesson-plans/*").hasRole("STAFF")
                        .requestMatchers(HttpMethod.PUT, "/api/sample-lesson-plans/*").hasRole("STAFF")
                        .requestMatchers(HttpMethod.DELETE, "/api/sample-lesson-plans/*").hasRole("STAFF")
                        .requestMatchers(HttpMethod.POST, "/api/sample-lesson-plans/*/submit").hasRole("STAFF")

                        // admin CRUD curriculum templates
                        .requestMatchers(HttpMethod.POST, "/api/curriculum-templates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/api/curriculum-templates/**").hasRole("ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/api/curriculum-templates/**").hasRole("ADMIN")
                        //active template cho teacher/staff/manager/admin xem
                        .requestMatchers(HttpMethod.POST, "/api/curriculum-templates/*/activate").hasAnyRole("ADMIN", "STAFF", "MANAGER", "TEACHER")
                        //các GET template còn lại chỉ admin mới xem được
                        .requestMatchers(HttpMethod.GET, "/api/curriculum-templates/**").hasAnyRole("ADMIN")

                        // lesson plan của teacher
                        .requestMatchers("/api/lesson-plans/**").hasRole("TEACHER")

                        // các request còn lại phải login
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}