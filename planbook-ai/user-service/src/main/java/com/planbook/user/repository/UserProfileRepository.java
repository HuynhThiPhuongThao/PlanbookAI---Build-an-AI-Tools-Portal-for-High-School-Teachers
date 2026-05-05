package com.planbook.user.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.planbook.user.entity.Role;
import com.planbook.user.entity.UserProfile;
//Repository là lớp duy nhất được phép nói chuyện với Database. Mọi thứ trên nó (Service, Controller) muốn lấy data phải đi qua Repository.
@Repository
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByEmail(String email);
    List<UserProfile> findByRole(Role role);
    List<UserProfile> findByRoleAndActiveTrue(Role role);
    List<UserProfile> findByActive(boolean active);
    List<UserProfile> findByActiveTrue();
    List<UserProfile> findByRoleInAndActiveTrue(List<Role> roles);
    boolean existsByEmail(String email);
}
