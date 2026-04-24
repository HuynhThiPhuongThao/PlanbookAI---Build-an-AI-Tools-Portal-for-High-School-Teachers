package com.planbook.question_bank_service.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.planbook.question_bank_service.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserContextService {
    
    public Long getCurrentUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            // Lấy từ JWT claims
            Object userId = auth.getDetails();
            return userId != null ? Long.parseLong(userId.toString()) : 1L; // Temporary
        }
        return 1L; // Temporary for testing
    }
    
    public String getCurrentUserName() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getName();
        }
        return "System";
    }
    
    public String getCurrentUserRole() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            return auth.getAuthorities().stream()
                    .findFirst()
                    .map(grantedAuthority -> grantedAuthority.getAuthority().replace("ROLE_", ""))
                    .orElse("TEACHER");
        }
        return "TEACHER";
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
        throw new UnauthorizedException("Yêu cầu một trong các quyền: " + String.join(", ", roles));
    }
    
    public boolean isCurrentUserAuthor(Long authorId) {
        return getCurrentUserId().equals(authorId);
    }
}