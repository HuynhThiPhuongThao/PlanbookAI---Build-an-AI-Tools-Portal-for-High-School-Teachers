package com.planbook.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

// =====================================================================
// JWTAUTHFILTER – Bảo vệ đứng cổng, quét thẻ mỗi người vào
// =====================================================================
// TẠI SAO LẠI LÀ "FILTER"?
// → Filter là code chạy TRƯỚC KHI request đến Controller
// → Giống security checkpoint ở sân bay: mày phải qua đây trước,
//   sau đó mới được vào cổng lên máy bay (Controller)
//
// TẠI SAO EXTEND OncePerRequestFilter?
// → "Once per request" = chỉ chạy 1 lần mỗi request
// → Tránh trường hợp Spring chạy filter 2-3 lần do redirect nội bộ
// → Dùng cái này thay vì Filter thông thường vì an toàn hơn
//
// LUỒNG ĐI:
//   Client gửi request
//       ↓
//   JwtAuthFilter.doFilterInternal() chạy ĐẦU TIÊN
//       ↓ (nếu token hợp lệ)
//   Set authentication vào SecurityContext
//       ↓
//   Controller nhận request (đã biết là ai, quyền gì)
// =====================================================================

@Component
// @Component → Spring quản lý class này (tự tạo instance, tự inject vào SecurityConfig)
@RequiredArgsConstructor
// @RequiredArgsConstructor (Lombok) → tự gen constructor inject jwtService và userDetailsService
// TẠI SAO KHÔNG DÙNG @Autowired trực tiếp?
// → Constructor injection an toàn hơn field injection
//   (Google và Spring team khuyên dùng constructor injection)
@Slf4j
// @Slf4j (Lombok) → tự tạo biến: private static final Logger log = ...
// Dùng: log.info("..."), log.warn("..."), log.error("...")
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;

    // =================================================================
    // doFilterInternal – Code chạy mỗi khi có request đến
    // =================================================================
    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,   // Thông tin request đến
            @NonNull HttpServletResponse response, // Kết quả sẽ trả về
            @NonNull FilterChain filterChain       // Chuỗi filter tiếp theo
    ) throws ServletException, IOException {

        // BƯỚC 1: Lấy header Authorization từ request
        // Mọi request có token sẽ gửi kèm header: "Authorization: Bearer eyJhbG..."
        final String authHeader = request.getHeader("Authorization");

        // BƯỚC 2: Kiểm tra header có tồn tại và đúng format không
        // TẠI SAO CHECK "Bearer "?
        // → Đây là standard của Bearer Token (RFC 6750)
        // → Giống như ATM chỉ nhận thẻ Visa/MasterCard, không nhận thẻ thư viện
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            // Không có token → không phải lỗi, chỉ là request public (login, register)
            // Cho đi tiếp, SecurityConfig sẽ quyết định có cho vào không
            filterChain.doFilter(request, response);
            return;  // Dừng code ở đây, không chạy tiếp
        }

        try {
            // BƯỚC 3: Cắt "Bearer " (7 ký tự) để lấy token thuần
            // "Bearer eyJhbGciOiJ..." → "eyJhbGciOiJ..."
            final String jwt = authHeader.substring(7);

            // BƯỚC 4: Đọc email từ token (không cần DB, đọc thẳng từ token)
            final String email = jwtService.extractUsername(jwt);

            // BƯỚC 5: Kiểm tra xem đã authenticate chưa
            // TẠI SAO PHẢI CHECK SecurityContextHolder.getContext().getAuthentication() == null?
            // → Tránh authenticate 2 lần nếu request đã được xử lý (hiếm nhưng có thể xảy ra)
            // → Giống bảo vệ không quét thẻ người đang trong nhà hàng ra → vào lại
            if (email != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // BƯỚC 6: Load UserDetails từ DB (để lấy password, role, isActive...)
                // TẠI SAO CẦN LOAD TỪ DB? Token không đủ sao?
                // → Cần check: tài khoản có còn active không? (có thể bị ban sau khi tạo token)
                // → Cần UserDetails object để Spring Security hiểu
                UserDetails userDetails = userDetailsService.loadUserByUsername(email);

                // BƯỚC 7: Validate token
                // Check: email trong token khớp user? chưa hết hạn?
                if (jwtService.isTokenValid(jwt, userDetails)) {

                    // BƯỚC 8: Tạo Authentication object và lưu vào SecurityContext
                    // TẠI SAO CẦN UsernamePasswordAuthenticationToken?
                    // → Đây là class Spring Security dùng để đại diện cho "người đã đăng nhập"
                    // → Tham số (userDetails, null, authorities):
                    //   1. userDetails = ai đang login
                    //   2. null = credentials (không cần password ở đây vì đã verify rồi)
                    //   3. authorities = quyền hạn (ROLE_TEACHER, ROLE_ADMIN...)
                    UsernamePasswordAuthenticationToken authToken =
                        new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                        );

                    // Thêm thông tin request (IP, session...) vào authentication
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Lưu vào SecurityContext – từ đây Spring biết request này là của ai
                    // Giống "đã quét thẻ, ghi tên vào sổ đang ở trong nhà hàng"
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        } catch (Exception e) {
            // Token lỗi (giả mạo, hết hạn...) → log warning, tiếp tục
            // TẠI SAO KHÔNG THROW EXCEPTION?
            // → Để SecurityConfig tự xử lý (trả 401) thay vì crash server
            log.warn("JWT validation failed: {}", e.getMessage());
        }

        // BƯỚC CUỐI: Chuyển request sang filter tiếp theo (hoặc Controller)
        // TẠI SAO CẦN filterChain.doFilter()?
        // → Filter hoạt động theo chuỗi (chain): Filter1 → Filter2 → Controller
        // → Nếu không gọi cái này, request bị "tắc" ở đây, không đến Controller
        // → Giống bảo vệ sau khi quét thẻ phải "mở cửa" cho người vào
        filterChain.doFilter(request, response);
    }
}
