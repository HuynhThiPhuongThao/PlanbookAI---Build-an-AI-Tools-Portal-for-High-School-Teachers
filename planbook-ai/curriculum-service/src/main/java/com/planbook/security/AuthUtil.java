package com.planbook.security;

import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component
public class AuthUtil {

    private CustomUserPrincipal extractPrincipal(Authentication authentication) {
        if (authentication == null || authentication.getPrincipal() == null) {
            throw new AccessDeniedException("Authentication is missing");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserPrincipal customUserPrincipal)) {
            throw new AccessDeniedException("Invalid authentication principal");
        }

        return customUserPrincipal;
    }

    public Long extractAdminId(Authentication authentication) {
        CustomUserPrincipal principal = extractPrincipal(authentication);
        if (!"ADMIN".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Authenticated user is not an admin");
        }
        return principal.getUserId();
    }

    public Long extractStaffId(Authentication authentication) {
        CustomUserPrincipal principal = extractPrincipal(authentication);
        if (!"STAFF".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Authenticated user is not a staff");
        }
        return principal.getUserId();
    }

    public Long extractManagerId(Authentication authentication) {
        CustomUserPrincipal principal = extractPrincipal(authentication);
        if (!"MANAGER".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Authenticated user is not a manager");
        }
        return principal.getUserId();
    }

    public Long extractTeacherId(Authentication authentication) {
        CustomUserPrincipal principal = extractPrincipal(authentication);
        if (!"TEACHER".equalsIgnoreCase(principal.getRole())) {
            throw new AccessDeniedException("Authenticated user is not a teacher");
        }
        return principal.getUserId();
    }

    public String extractUsername(Authentication authentication) {
        return extractPrincipal(authentication).getUsername();
    }

    public String extractRole(Authentication authentication) {
        return extractPrincipal(authentication).getRole();
    }
}