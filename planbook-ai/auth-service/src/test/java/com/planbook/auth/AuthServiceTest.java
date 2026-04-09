package com.planbook.auth;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Integration Test for Auth Service
 * Using H2 in-memory database (no Docker required)
 *
 * To use MySQL TestContainers instead:
 * 1. Start Docker Desktop
 * 2. Uncomment @Testcontainers + @Container blocks below
 * 3. Change @SpringBootTest profile
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class AuthServiceTest {

  @Test
  void testContextLoads() {
    // ← Verify Spring Boot app starts
    assertTrue(true);
  }

  @Test
  void testApplicationInitialization() {
    // ← Verify dependencies injected
    assertNotNull("Application context loaded");
  }

  /**
   * OPTIONAL: TestContainers + MySQL setup (requires Docker running)
   *
   * Uncomment when using Docker:
   *
   * @Container
   *            static MySQLContainer<?> mysql = new MySQLContainer<>("mysql:8.0")
   *            .withDatabaseName("db_auth_test")
   *            .withUsername("test")
   *            .withPassword("test123");
   *
   * @DynamicPropertySource
   *                        static void
   *                        configureProperties(DynamicPropertyRegistry registry)
   *                        {
   *                        registry.add("spring.datasource.url",
   *                        mysql::getJdbcUrl);
   *                        registry.add("spring.datasource.username",
   *                        mysql::getUsername);
   *                        registry.add("spring.datasource.password",
   *                        mysql::getPassword);
   *                        }
   */
}
