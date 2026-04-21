package com.grocery.core.dto;

import lombok.Data;

// ===== RegisterRequest.java =====
// Used for customer registration
@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String contact;
    private String address;
    private String otp;
}
