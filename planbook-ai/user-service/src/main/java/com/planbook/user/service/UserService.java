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
    public UserResponse getProfile(Long userId, String email, String fullName, String role) {
        UserProfile profile = getOrCreateProfileEntity(userId, email, fullName, role);
        return toResponse(profile); // // convert Entity → DTO rồi trả về
    }

    private UserProfile getOrCreateProfileEntity(Long userId, String email, String fullName, String role) {
        return userProfileRepository.findById(userId)
                .orElseGet(() -> {
                    if (email == null) {
                        throw new RuntimeException("User profile not initialized and cannot be lazy-created via Admin API. User must login first.");
                    }
                    log.info("Lazy creating profile for new user: {}", email);
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUserId(userId);
                    newProfile.setEmail(email);
                    newProfile.setFullName(fullName);
                    newProfile.setRole(com.planbook.user.entity.Role.valueOf(role));
                    newProfile.setActive(true);
                    return userProfileRepository.save(newProfile);
                });
    }

    // === LẤY TẤT CẢ ===
    public List<UserResponse> getAllProfiles() {
        return userProfileRepository.findAll() // lay tat ca tu DB
                .stream() // chuyen thanh stream
                .map(this::toResponse) // convert Entity → DTO
                .collect(Collectors.toList()); // chuyen thanh List<UserResponse>
    }

    // === INTERNAL: Tạo profile sau khi auth-service tạo account ===
    // Được gọi từ auth-service qua Docker internal network (không qua Gateway)
    @Transactional
    public void initProfile(com.planbook.user.dto.InitProfileRequest request) {
        // Nếu đã có profile rồi (idempotent) → bỏ qua, không ghi đè
        if (userProfileRepository.existsById(request.getUserId())) {
            log.info("Profile đã tồn tại cho userId={}, bỏ qua init.", request.getUserId());
            return;
        }
        UserProfile profile = new UserProfile();
        profile.setUserId(request.getUserId());
        profile.setEmail(request.getEmail());
        profile.setFullName(request.getFullName());
        profile.setRole(com.planbook.user.entity.Role.valueOf(request.getRole()));
        profile.setActive(true);
        userProfileRepository.save(profile);
        log.info("Đã khởi tạo profile cho userId={} role={}", request.getUserId(), request.getRole());
    }


    // === CẬP NHẬT PROFILE ===
    @Transactional // nếu có lỗi giữa chừng → rollback, không lưu nửa vời
    public UserResponse updateProfile(Long userId, UpdateProfileRequest request, String email, String fullName, String role) {
        UserProfile profile = getOrCreateProfileEntity(userId, email, fullName, role);
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

    // === FCM TOKEN ===
    @Transactional
    public void updateFcmToken(Long userId, String token) {
        userProfileRepository.findById(userId).ifPresent(profile -> {
            profile.setFcmToken(token);
            userProfileRepository.save(profile);
            log.info("Cập nhật FCM Token cho user {}", userId);
        });
    }

    public String getFcmToken(Long userId) {
        return userProfileRepository.findById(userId)
                .map(UserProfile::getFcmToken)
                .orElse(null);
    }

    public List<String> getActiveManagerFcmTokens() {
        return userProfileRepository.findByRoleAndActiveTrue(com.planbook.user.entity.Role.MANAGER)
                .stream()
                .map(UserProfile::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .collect(Collectors.toList());
    }

    public List<String> getActiveFcmTokens() {
        return userProfileRepository.findByActiveTrue()
                .stream()
                .map(UserProfile::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    public List<String> getActiveInternalFcmTokens() {
        return userProfileRepository.findByRoleInAndActiveTrue(List.of(
                        com.planbook.user.entity.Role.ADMIN,
                        com.planbook.user.entity.Role.MANAGER,
                        com.planbook.user.entity.Role.STAFF
                ))
                .stream()
                .map(UserProfile::getFcmToken)
                .filter(token -> token != null && !token.isBlank())
                .distinct()
                .collect(Collectors.toList());
    }

    public boolean isUserActive(Long userId) {
        return userProfileRepository.findById(userId)
                .map(UserProfile::isActive)
                .orElse(true);
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
