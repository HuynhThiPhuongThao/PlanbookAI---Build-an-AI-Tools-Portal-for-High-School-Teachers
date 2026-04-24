package com.planbook.user.entity;

import lombok.*;
import jakarta.persistence.*;
import java.time.LocalDateTime;
//file nay la "bản đồ" để Spring JPA biết bảng user_profiles trong MySQL trông như thế nào.

@Entity
@Table(name = "user_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserProfile {
   @Id
    private Long userId;
    @Column(nullable = false, unique = true)
    private String email;
    @Column(name = "full_name")
    private String fullName;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private Role role = Role.TEACHER;
    // MEDIUMTEXT = chứa được tối đa 16MB → đủ để lưu ảnh Base64 (~50-200KB)
    // VARCHAR(255) cũ chỉ chứa được 255 ký tự → không thể lưu Base64
    @Column(name = "avatar_url", columnDefinition = "MEDIUMTEXT")
    private String avatarUrl;
    @Column(name = "phone_number")
    private String phoneNumber;
    @Column(name = "school_name")
    private String schoolName;
    @Column(name = "subject_specialty")
    private String subjectSpecialty;
    @Column(columnDefinition = "TEXT")
    private String bio;
    @Column(name = "is_active")
    @Builder.Default
    private boolean active = true;
    @Column(name = "fcm_token")
    private String fcmToken;
    @Column(name = "created_at", updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
    @Column(name = "updated_at")
    @Builder.Default
    private LocalDateTime updatedAt = LocalDateTime.now();
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

}
//Với JPA + Entity → Spring tự generate SQL đó,  chỉ cần gọi:
//repository.findById(userId)