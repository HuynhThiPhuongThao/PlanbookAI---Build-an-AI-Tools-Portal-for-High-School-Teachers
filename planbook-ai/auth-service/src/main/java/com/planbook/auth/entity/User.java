package com.planbook.auth.entity;

import jakarta.persistence.*;
import lombok.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

/**
 * Entity User trong auth-service.
 *
 * LƯU Ý MICROSERVICE: Entity này chỉ có role (String) thay vì join sang bảng roles.
 * Trong microservice, auth-service chỉ cần biết role name để issue JWT claims.
 * User management chi tiết sẽ do user-service xử lý.
 *
 * auth-service implements UserDetails để tích hợp trực tiếp với Spring Security.
 */
@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(name = "password_hash", nullable = false)
    private String password;

    @Column(name = "full_name")
    private String fullName;

    /**
     * Role lưu dạng String: ADMIN, MANAGER, STAFF, TEACHER
     * Không join sang bảng role – giữ auth-service đơn giản và stateless
     */
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.TEACHER;

    @Column(name = "is_active")
    @Builder.Default
    private boolean isActive = true;

    @Column(name = "created_at")
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    // ===== UserDetails implementation =====

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        // Spring Security cần prefix "ROLE_" cho role-based checks
        return List.of(new SimpleGrantedAuthority("ROLE_" + role.name()));
    }

    @Override
    public String getUsername() {
        return email;  // Username = email trong hệ thống này
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return isActive; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return isActive; }
}
