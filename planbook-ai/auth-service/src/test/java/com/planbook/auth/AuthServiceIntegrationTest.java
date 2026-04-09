package com.planbook.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.planbook.auth.dto.AuthResponse;
import com.planbook.auth.dto.LoginRequest;
import com.planbook.auth.entity.Role;
import com.planbook.auth.entity.User;
import com.planbook.auth.repository.UserRepository;
import com.planbook.auth.service.AuthService;

import static org.assertj.core.api.Assertions.*;
import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Test for Auth Service
 * Using H2 in-memory database (no Docker required)
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthServiceIntegrationTest {

  @Autowired
  private AuthService authService;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private PasswordEncoder passwordEncoder;

  @Test
  void testLoginSuccess() {
    // Setup: Create test user
    User testUser = User.builder()
        .email("teacher@test.com")
        .password(passwordEncoder.encode("Pass@123"))
        .fullName("Test Teacher")
        .role(Role.TEACHER)
        .build();
    userRepository.save(testUser);

    // Execute
    LoginRequest loginReq = new LoginRequest();
    loginReq.setEmail("teacher@test.com");
    loginReq.setPassword("Pass@123");

    AuthResponse res = authService.login(loginReq);

    // Assert
    assertThat(res.getAccessToken()).isNotBlank();
    assertThat(res.getRefreshToken()).isNotBlank();
    assertThat(res.getTokenType()).isEqualTo("Bearer");
    assertThat(res.getEmail()).isEqualTo("teacher@test.com");
  }

  @Test
  void testLoginFailWrongPassword() {
    // Setup
    User testUser = User.builder()
        .email("teacher@test.com")
        .password(passwordEncoder.encode("Pass@123"))
        .fullName("Test Teacher")
        .role(Role.TEACHER)
        .build();
    userRepository.save(testUser);

    // Execute & Assert
    LoginRequest loginReq = new LoginRequest();
    loginReq.setEmail("teacher@test.com");
    loginReq.setPassword("WrongPassword");

    assertThrows(RuntimeException.class, () -> {
      authService.login(loginReq);
    });
  }

  @Test
  void testLoginFailUserNotFound() {
    // Execute & Assert
    LoginRequest loginReq = new LoginRequest();
    loginReq.setEmail("nonexistent@test.com");
    loginReq.setPassword("Pass@123");

    assertThrows(RuntimeException.class, () -> {
      authService.login(loginReq);
    });
  }
}