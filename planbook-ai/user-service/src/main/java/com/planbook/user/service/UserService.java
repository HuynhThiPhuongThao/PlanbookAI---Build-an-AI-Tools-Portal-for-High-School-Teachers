package com.planbook.user.service;

import com.planbook.user.dto.UpdateProfileRequest;
import com.planbook.user.dto.UserResponse;
import com.planbook.user.entity.UserProfile;
import com.planbook.user.repository.UserProfileRepository;
import com.planbook.user.security.TokenBlacklistService;

import lombok.RequiredArgsConstructor; // tạo constructor inject dependency
import lombok.extern.slf4j.Slf4j; // tạo biến log để ghi log
import org.springframework.stereotype.Service; // đánh dấu đây là Service bean
import org.springframework.transaction.annotation.Transactional; // bọc DB operation trong 1 transaction
import java.util.List;
import java.util.stream.Collectors;

@Service // Spring quản lý class này, tự inject vào Controller
@RequiredArgsConstructor // Lombok tạo constructor với các field final
@Slf4j // Tạo biến: private static final Logger log = ...

// – xử lý toàn bộ logic nghiệp vụ. Không đụng DB trực tiếp (nhờ Repository),
// không biết HTTP request là gì (Controller lo)
// getProfile(userId) → lấy profile 1 user
// updateProfile(...) → cập nhật thông tin
// deactivateUser(userId) → khóa tài khoản
// activateUser(userId) → mở lại tài khoản
public class UserService {
    // final: chỉ có thể gán 1 lần
    private final UserProfileRepository userProfileRepository;
    private final TokenBlacklistService tokenBlacklistService;

    // lấy profile
    public UserResponse getProfile(Long userId) {
        // Tìm trong DB, nếu không có => lỗi
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found" + userId));
        return toResponse(profile); // // convert Entity → DTO rồi trả về
    }

    // === LẤY TẤT CẢ ===
    public List<UserResponse> getAllProfiles() {
        return userProfileRepository.findAll() // lay tat ca tu DB
                .stream() // chuyen thanh stream
                .map(this::toResponse) // convert Entity → DTO
                .collect(Collectors.toList()); // chuyen thanh List<UserResponse>
    }

    // === CẬP NHẬT PROFILE ===
    @Transactional // nếu có lỗi giữa chừng → rollback, không lưu nửa vời
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found" + userId));
        // Chỉ update field nào client có gửi lên (không null)
        // Nếu client không gửi fullName thì giữ nguyên giá trị cũ
        if (request.getFullName() != null)
            profile.setFullName(request.getFullName());
        if (request.getAvatarUrl() != null)
            profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getPhoneNumber() != null)
            profile.setPhoneNumber(request.getPhoneNumber());
        if (request.getSchoolName() != null)
            profile.setSchoolName(request.getSchoolName());
        if (request.getSubjectSpecialty() != null)
            profile.setSubjectSpecialty(request.getSubjectSpecialty());
        if (request.getBio() != null)
            profile.setBio(request.getBio());
        return toResponse(userProfileRepository.save(profile));
    }

    // === KHÓA / MỞ TÀI KHOẢN ===
    @Transactional
    public void deactivateUser(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found" + userId));
        profile.setActive(false);
        userProfileRepository.save(profile);
        tokenBlacklistService.blacklistUser(userId); // Block ngay, không chờ token hết hạn
        log.info("User {} deactivated and blacklisted", userId);
    }

    @Transactional
    public void activateUser(Long userId) {
        UserProfile profile = userProfileRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found" + userId));
        profile.setActive(true);
        userProfileRepository.save(profile);
        tokenBlacklistService.removeUserBlacklist(userId); // Mở khóa Redis
        log.info("User {} activated and removed from blacklist", userId);
    }

    // === PRIVATE HELPER ===
    // Convert Entity UserProfile → DTO UserResponse
    // Tách ra method riêng vì dùng ở nhiều chỗ (getProfile, updateProfile...)
    private UserResponse toResponse(UserProfile profile) {
        return UserResponse.builder()
                .userId(profile.getUserId())
                .email(profile.getEmail())
                .fullName(profile.getFullName())
                .role(String.valueOf(profile.getRole()))
                .avatarUrl(profile.getAvatarUrl())
                .phoneNumber(profile.getPhoneNumber())
                .schoolName(profile.getSchoolName())
                .subjectSpecialty(profile.getSubjectSpecialty())
                .bio(profile.getBio())
                .active(profile.isActive())
                .createdAt(profile.getCreatedAt())
                .build();
    }
}
