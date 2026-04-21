package com.grocery.core.controller;

import com.grocery.core.dto.*;
import com.grocery.core.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired private AuthService authService;
    @Autowired private OtpService otpService;
    @Autowired private EmailService emailService;

    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse> sendOtp(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String name = body.get("name");
            if (email == null || email.isEmpty()) throw new RuntimeException("Email is required");
            String otp = otpService.generateOtp(email);
            emailService.sendOtpEmail(email, name != null ? name : "Customer", otp);
            return ResponseEntity.ok(new ApiResponse(true, "OTP sent securely to " + email));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage()));
        }
    }

    // POST /api/auth/register
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@RequestBody RegisterRequest req) {
        try {
            if (req.getOtp() == null || !otpService.validateOtp(req.getEmail(), req.getOtp())) {
                throw new RuntimeException("Invalid or Expired OTP provided.");
            }
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(authService.registerCustomer(req));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // POST /api/auth/login
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@RequestBody LoginRequest req) {
        try {
            return ResponseEntity.ok(authService.login(req));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // PUT /api/auth/customer/{id}
    @PutMapping("/customer/{id}")
    public ResponseEntity<ApiResponse> updateCustomer(
            @PathVariable Integer id,
            @RequestBody RegisterRequest req) {
        try {
            return ResponseEntity.ok(authService.updateCustomer(id, req));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // PUT /api/auth/change-password/{loginId}
    @PutMapping("/change-password/{loginId}")
    public ResponseEntity<ApiResponse> changePassword(
            @PathVariable Integer loginId,
            @RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(
                    authService.changePassword(loginId, body.get("oldPassword"), body.get("newPassword")));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // PUT /api/auth/deactivate/{loginId}
    @PutMapping("/deactivate/{loginId}")
    public ResponseEntity<ApiResponse> deactivate(@PathVariable Integer loginId) {
        try {
            return ResponseEntity.ok(authService.deactivateAccount(loginId));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // PUT /api/auth/forgot-password
    @PutMapping("/forgot-password")
    public ResponseEntity<ApiResponse> forgotPassword(@RequestBody Map<String, String> body) {
        try {
            String email = body.get("email");
            String otp = body.get("otp");
            String newPassword = body.get("newPassword");
            
            if (email == null || otp == null || newPassword == null) {
                throw new RuntimeException("Missing required fields");
            }
            if (!otpService.validateOtp(email, otp)) {
                throw new RuntimeException("Invalid or Expired OTP.");
            }
            return ResponseEntity.ok(authService.resetPasswordUsingEmail(email, newPassword));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // PUT /api/auth/restore (Admin)
    @PutMapping("/restore")
    public ResponseEntity<ApiResponse> restore(@RequestBody Map<String, String> body) {
        try {
            return ResponseEntity.ok(authService.restoreAccount(body.get("email")));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }

    // GET /api/auth/customers  (Admin)
    @GetMapping("/customers")
    public ResponseEntity<ApiResponse> getAllCustomers() {
        try {
            return ResponseEntity.ok(authService.getAllCustomers());
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse(false, e.getMessage()));
        }
    }
}
