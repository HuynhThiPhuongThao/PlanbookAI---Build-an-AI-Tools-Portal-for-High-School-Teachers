package com.planbook.user.dto;

import lombok.Data;

@Data
public class CreateUserRequest {
    private String email;
    private String fullName;
    private String role; // TEACHER | ADMIN | MANAGER | STAFF
    private String password; // Optional - neu null thi dung mat khau mac dinh Planbook@2026
    private String phoneNumber;
    private String schoolName;
}
