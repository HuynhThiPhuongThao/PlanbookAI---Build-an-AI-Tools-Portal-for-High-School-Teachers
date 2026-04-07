đ# PlanbookAI – Phân tích OOP trong Đồ án

## Tổng quan đồ án

**PlanbookAI** là hệ thống hỗ trợ giáo viên THPT môn Hóa học, xây dựng theo kiến trúc **Microservice** bằng Java Spring Boot.

> Java là ngôn ngữ OOP thuần túy – mọi thứ đều là Object. SpringBoot áp dụng đầy đủ 4 tính chất OOP.

---

## 1. Encapsulation (Đóng gói)

Che giấu dữ liệu bên trong object, chỉ cho phép truy cập qua getter/setter.

```java
// entity/UserProfile.java
@Getter @Setter
public class UserProfile {
    private Long userId;    // private = bên ngoài không đọc/ghi trực tiếp
    private String email;   // phải đi qua getEmail() / setEmail()
    private boolean active; // → isActive(), setActive()
}
```

File áp dụng: `UserProfile.java`, `UserResponse.java`, `UpdateProfileRequest.java`

---

## 2. Inheritance (Kế thừa)

Class con kế thừa property và method của class cha, tái sử dụng code.

```java
// repository/UserProfileRepository.java
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    // Kế thừa: save(), findById(), findAll(), deleteById()...
    // Chỉ thêm method đặc thù của mình:
    Optional<UserProfile> findByEmail(String email);
}

// security/JwtAuthFilter.java
public class JwtAuthFilter extends OncePerRequestFilter {
    @Override  // Override method của class cha
    protected void doFilterInternal(...) {
        // Logic JWT tùy chỉnh ở đây
    }
}
```

| File | Kế thừa từ | Được gì |
|------|-----------|---------|
| `UserProfileRepository` | `JpaRepository` | CRUD miễn phí |
| `JwtAuthFilter` | `OncePerRequestFilter` | Filter lifecycle |

---

## 3. Polymorphism (Đa hình)

Cùng 1 method nhưng hoạt động khác nhau tùy object/context.

```java
// controller/UserController.java
ResponseEntity<UserResponse> getMyProfile(...)    // trả object đơn
ResponseEntity<List<UserResponse>> getAllUsers()   // trả danh sách
ResponseEntity<String> deactivateUser(...)        // trả chuỗi
// Cùng kiểu ResponseEntity nhưng nội dung khác nhau → Polymorphism
```

---

## 4. Abstraction (Trừu tượng hóa)

Ẩn đi chi tiết cài đặt phức tạp, chỉ expose những gì cần thiết.

```java
// UserProfileRepository là interface thuần – không có code cài đặt
public interface UserProfileRepository extends JpaRepository<UserProfile, Long> {
    Optional<UserProfile> findByEmail(String email);
    // Spring Data JPA tự sinh SQL bên dưới
}

// UserController chỉ biết gọi, không biết bên trong làm gì:
userService.getProfile(userId);
// → UserService abstract hóa toàn bộ business logic
```

---

## Sơ đồ kiến trúc Layered + OOP

```
Controller (UserController)
  → Abstraction + Polymorphism
      ↓
Service (UserService)
  → Abstraction + Encapsulation (private methods)
      ↓
Repository (UserProfileRepository)
  → Inheritance (JpaRepository) + Abstraction (interface)
      ↓
Entity (UserProfile)
  → Encapsulation (private fields + getter/setter)
```

---

## Design Patterns sử dụng

| Pattern | Dùng ở đâu | Mục đích |
|---------|-----------|---------|
| Repository Pattern | `UserProfileRepository` | Tách biệt data access |
| Builder Pattern | `UserResponse.builder()` | Tạo object linh hoạt |
| Filter Chain | `JwtAuthFilter` | Xử lý request theo chuỗi |
| DTO Pattern | `UserResponse`, `UpdateProfileRequest` | Tách domain model khỏi API |
| Dependency Injection | `@RequiredArgsConstructor` | Giảm coupling |
| Singleton Pattern | `@Service`, `@Repository` | Spring Bean mặc định Singleton |

---

## Tóm tắt OOP theo file

| File | Encapsulation | Inheritance | Polymorphism | Abstraction |
|------|:---:|:---:|:---:|:---:|
| `UserProfile.java` | ✅ | | | |
| `Role.java` | | | ✅ enum | ✅ |
| `UserProfileRepository.java` | | ✅ | | ✅ interface |
| `UserResponse.java` | ✅ | | | ✅ |
| `UpdateProfileRequest.java` | ✅ | | | ✅ |
| `UserService.java` | ✅ private | | ✅ | ✅ |
| `UserController.java` | | | ✅ ResponseEntity | ✅ |
| `JwtUtil.java` | ✅ private | | | ✅ |
| `JwtAuthFilter.java` | | ✅ extends | ✅ @Override | |
| `SecurityConfig.java` | | | | ✅ |
| `GlobalExceptionHandler.java` | | | ✅ @ExceptionHandler | ✅ |
