package com.planbook.question_bank_service.service;

import com.planbook.question_bank_service.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class UserContextService {

    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth.getPrincipal() == null) {
            throw new UnauthorizedException("Unauthenticated request");
        }

        Object principal = auth.getPrincipal();
        if (principal instanceof Long userId) {
            return userId;
        }
        if (principal instanceof String value) {
            return Long.parseLong(value);
        }

        throw new UnauthorizedException("Cannot resolve current user id from token");
    }

    public String getCurrentUserName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return "System";
        }
        if (auth.getDetails() instanceof String username && !username.isBlank()) {
            return username;
        }
        return auth.getName();
    }

    public String getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            throw new UnauthorizedException("Unauthenticated request");
        }

        return auth.getAuthorities().stream()
                .findFirst()
                .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                .orElseThrow(() -> new UnauthorizedException("Role not found in token"));
    }

    public boolean hasRole(String role) {
        return getCurrentUserRole().equals(role);
    }

    public void requireRole(String... roles) {
        String currentRole = getCurrentUserRole();
        for (String role : roles) {
            if (currentRole.equals(role)) {
                return;
            }
        }
        throw new UnauthorizedException("Required roles: " + String.join(", ", roles));
    }

    public boolean isCurrentUserAuthor(Long authorId) {
        return getCurrentUserId().equals(authorId);
    }
}
