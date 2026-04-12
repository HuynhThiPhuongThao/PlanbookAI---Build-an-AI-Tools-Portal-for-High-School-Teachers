package com.planbook.question_bank_service.exception;

import lombok.Getter;

@Getter
public class UnauthorizedException extends RuntimeException {
    
    private final String requiredRole;
    private final String currentRole;
    
    public UnauthorizedException(String message) {
        super(message);
        this.requiredRole = null;
        this.currentRole = null;
    }
    
    public UnauthorizedException(String message, String requiredRole, String currentRole) {
        super(message);
        this.requiredRole = requiredRole;
        this.currentRole = currentRole;
    }
    
    public UnauthorizedException(String message, Throwable cause) {
        super(message, cause);
        this.requiredRole = null;
        this.currentRole = null;
    }
}