package com.planbook.auth;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.planbook.auth.dto.RegisterRequest;
import com.planbook.auth.entity.User;
import com.planbook.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.test.web.servlet.result.MockMvcResultHandlers.print;

/**
 * Registration Integration Test
 * Test POST /api/auth/register endpoint
 */
@SpringBootTest
@AutoConfigureMockMvc
public class RegistrationIntegrationTest {

  @Autowired
  private MockMvc mockMvc;

  @Autowired
  private UserRepository userRepository;

  @Autowired
  private ObjectMapper objectMapper;

  @BeforeEach
  void setUp() {
    // Clear database before each test
    userRepository.deleteAll();
  }

  @Test
  void testRegisterNewUserSuccess() throws Exception {
    // Arrange
    RegisterRequest request = new RegisterRequest();
    request.setEmail("newuser@test.com");
    request.setPassword("Test@1234");
    request.setFullName("Test User");

    String requestBody = objectMapper.writeValueAsString(request);

    // Act & Assert
    mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andDo(print())
        .andExpect(status().isOk());

    // Verify user saved to database
    User savedUser = userRepository.findByEmail("newuser@test.com").orElse(null);
    assertThat(savedUser).isNotNull();
    assertThat(savedUser.getFullName()).isEqualTo("Test User");
    assertThat(savedUser.getRole().name()).isEqualTo("TEACHER");
  }

  @Test
  void testRegisterDuplicateEmailFails() throws Exception {
    // Arrange - create first user
    User existingUser = User.builder()
        .email("existing@test.com")
        .password("hashedPassword")
        .fullName("Existing User")
        .build();
    userRepository.save(existingUser);

    // Try to register with same email
    RegisterRequest request = new RegisterRequest();
    request.setEmail("existing@test.com");
    request.setPassword("Test@1234");
    request.setFullName("Another User");

    String requestBody = objectMapper.writeValueAsString(request);

    // Act & Assert
    mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andDo(print())
        .andExpect(status().isBadRequest());
  }

  @Test
  void testRegisterMissingFields() throws Exception {
    // Arrange - missing password
    RegisterRequest request = new RegisterRequest();
    request.setEmail("test@test.com");
    request.setFullName("Test User");
    // password is null

    String requestBody = objectMapper.writeValueAsString(request);

    // Act & Assert
    mockMvc.perform(post("/api/auth/register")
        .contentType(MediaType.APPLICATION_JSON)
        .content(requestBody))
        .andDo(print())
        .andExpect(status().isBadRequest());
  }
}
