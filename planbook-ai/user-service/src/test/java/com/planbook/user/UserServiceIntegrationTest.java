package com.planbook.user;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import com.planbook.user.dto.UpdateProfileRequest;
import com.planbook.user.dto.UserResponse;
import com.planbook.user.entity.Role;
import com.planbook.user.entity.UserProfile;
import com.planbook.user.repository.UserProfileRepository;
import com.planbook.user.service.UserService;

import static org.assertj.core.api.Assertions.*;

/**
 * Integration Test for User Service
 * Using H2 in-memory database (no Docker required)
 */
@SpringBootTest
@ActiveProfiles("test")
@Transactional
public class UserServiceIntegrationTest {

  @Autowired
  private UserService userService;

  @Autowired
  private UserProfileRepository userProfileRepository;

  /**
   * Test 1: Get Profile - user xem profile của chính mình
   */
  @Test
  void testGetProfile() {
    // Given: tạo test user trong DB
    UserProfile testUser = UserProfile.builder()
        .userId(1L)
        .email("teacher@test.com")
        .fullName("Test Teacher")
        .role(Role.TEACHER)
        .phoneNumber("0123456789")
        .schoolName("Test School")
        .active(true)
        .build();
    userProfileRepository.save(testUser);

    // When: lấy profile
    UserResponse response = userService.getProfile(1L);

    // Then: verify
    assertThat(response).isNotNull();
    assertThat(response.getUserId()).isEqualTo(1L);
    assertThat(response.getEmail()).isEqualTo("teacher@test.com");
    assertThat(response.getFullName()).isEqualTo("Test Teacher");
    assertThat(response.isActive()).isTrue();
  }

  /**
   * Test 2: Update Profile
   */
  @Test
  void testUpdateProfile() {
    // Given: create test user
    UserProfile testUser = UserProfile.builder()
        .userId(2L)
        .email("update-test@test.com")
        .fullName("Old Name")
        .role(Role.TEACHER)
        .active(true)
        .build();
    userProfileRepository.save(testUser);

    // When: update
    UpdateProfileRequest request = new UpdateProfileRequest();
    request.setFullName("New Name");
    request.setPhoneNumber("9876543210");
    request.setSchoolName("New School");

    UserResponse response = userService.updateProfile(2L, request);

    // Then: verify updated
    assertThat(response.getFullName()).isEqualTo("New Name");
    assertThat(response.getPhoneNumber()).isEqualTo("9876543210");
    assertThat(response.getSchoolName()).isEqualTo("New School");

    // Verify in DB
    UserProfile updated = userProfileRepository.findById(2L).orElseThrow();
    assertThat(updated.getFullName()).isEqualTo("New Name");
  }

  /**
   * Test 3: Deactivate User (Admin khóa tài khoản)
   */
  @Test
  void testDeactivateUser() {
    // Given: create active user
    UserProfile testUser = UserProfile.builder()
        .userId(3L)
        .email("deactivate@test.com")
        .fullName("Test User")
        .role(Role.TEACHER)
        .active(true)
        .build();
    userProfileRepository.save(testUser);

    // When: deactivate
    userService.deactivateUser(3L);

    // Then: verify deactivated
    UserProfile deactivated = userProfileRepository.findById(3L).orElseThrow();
    assertThat(deactivated.isActive()).isFalse();
  }

  /**
   * Test 4: Activate User (Admin mở lại tài khoản)
   */
  @Test
  void testActivateUser() {
    // Given: create inactive user
    UserProfile testUser = UserProfile.builder()
        .userId(4L)
        .email("activate@test.com")
        .fullName("Test User")
        .role(Role.TEACHER)
        .active(false)
        .build();
    userProfileRepository.save(testUser);

    // When: activate
    userService.activateUser(4L);

    // Then: verify activated
    UserProfile activated = userProfileRepository.findById(4L).orElseThrow();
    assertThat(activated.isActive()).isTrue();
  }

  /**
   * Test 5: Find by Email
   */
  @Test
  void testFindByEmail() {
    // Given
    UserProfile testUser = UserProfile.builder()
        .userId(5L)
        .email("find-email@test.com")
        .fullName("Email Test")
        .role(Role.TEACHER)
        .active(true)
        .build();
    userProfileRepository.save(testUser);

    // When & Then
    assertThat(userProfileRepository.findByEmail("find-email@test.com"))
        .isPresent()
        .get()
        .satisfies(profile -> {
          assertThat(profile.getFullName()).isEqualTo("Email Test");
          assertThat(profile.isActive()).isTrue();
        });
  }

  /**
   * Test 6: Get Profile Not Found
   */
  @Test
  void testGetProfileNotFound() {
    // When & Then: should throw exception
    assertThatThrownBy(() -> userService.getProfile(999L))
        .isInstanceOf(RuntimeException.class)
        .hasMessageContaining("User not found");
  }
}
