package com.grocery.core.service;

import com.grocery.core.dto.*;
import com.grocery.core.model.*;
import com.grocery.core.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Service
public class AuthService {

    @Autowired private LoginRepository loginRepository;
    @Autowired private CustomerRepository customerRepository;

    private static final Pattern EMAIL_PATTERN =
            Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$");

    // ── US001: Customer Registration ──────────────────────────────────────────
    @Transactional
    public ApiResponse registerCustomer(RegisterRequest req) {
        if (!EMAIL_PATTERN.matcher(req.getEmail()).matches())
            throw new RuntimeException("Invalid email format");

        if (loginRepository.existsByEmail(req.getEmail()))
            throw new RuntimeException("Email already exists. Please use a different email.");

        Login login = new Login();
        login.setEmail(req.getEmail());
        login.setPassword(req.getPassword());
        login.setUserType("Customer");
        login.setStatus("Active");
        loginRepository.save(login);

        Customer customer = new Customer();
        customer.setName(req.getName());
        customer.setEmail(req.getEmail());
        customer.setContact(req.getContact());
        customer.setAddress(req.getAddress());
        customer.setLogin(login);
        customerRepository.save(customer);

        return new ApiResponse(true, "Customer registered successfully!");
    }

    // ── US003: Login (Customer + Admin) ───────────────────────────────────────
    public ApiResponse login(LoginRequest req) {
        if (!EMAIL_PATTERN.matcher(req.getEmail()).matches())
            throw new RuntimeException("Invalid email format");

        Login login = loginRepository.findByEmail(req.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!login.getPassword().equals(req.getPassword()))
            throw new RuntimeException("Invalid credentials");

        if ("Customer".equals(login.getUserType()) && "Inactive".equals(login.getStatus()))
            throw new RuntimeException("Your account is deactivated. Please restore it first.");

        Map<String, Object> data = new HashMap<>();
        data.put("loginId", login.getLoginId());
        data.put("email", login.getEmail());
        data.put("userType", login.getUserType());
        data.put("status", login.getStatus());

        if ("Customer".equals(login.getUserType())) {
            customerRepository.findByLogin(login).ifPresent(c -> {
                data.put("customerId", c.getCustomerId());
                data.put("name", c.getName());
            });
        }

        return new ApiResponse(true, "Login successful", data);
    }

    // ── US010: Update Customer Details ────────────────────────────────────────
    @Transactional
    public ApiResponse updateCustomer(Integer customerId, RegisterRequest req) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        if (req.getName() != null && !req.getName().isBlank())
            customer.setName(req.getName());
        if (req.getContact() != null)
            customer.setContact(req.getContact());
        if (req.getAddress() != null)
            customer.setAddress(req.getAddress());

        customerRepository.save(customer);
        return new ApiResponse(true, "Profile updated successfully", customer);
    }

    // ── US008 (Sprint 4): Change Password ─────────────────────────────────────
    @Transactional
    public ApiResponse changePassword(Integer loginId, String oldPwd, String newPwd) {
        if (newPwd.length() < 8 || newPwd.length() > 13)
            throw new RuntimeException("Password must be 8–13 characters");

        Login login = loginRepository.findById(loginId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!login.getPassword().equals(oldPwd))
            throw new RuntimeException("Old password is incorrect");

        login.setPassword(newPwd);
        loginRepository.save(login);
        return new ApiResponse(true, "Password changed successfully!");
    }

    // ── US011: Soft Delete (Deactivate) ───────────────────────────────────────
    @Transactional
    public ApiResponse deactivateAccount(Integer loginId) {
        Login login = loginRepository.findById(loginId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        login.setStatus("Inactive");
        loginRepository.save(login);
        return new ApiResponse(true, "Account deactivated successfully");
    }

    // ── Forgot Password / Restore ──────────────────────────────────────────────
    @Transactional
    public ApiResponse resetPasswordUsingEmail(String email, String newPwd) {
        if (newPwd.length() < 8 || newPwd.length() > 13)
            throw new RuntimeException("Password must be 8–13 characters");

        Login login = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        login.setPassword(newPwd);
        if ("Inactive".equals(login.getStatus())) {
            login.setStatus("Active");
        }
        loginRepository.save(login);
        return new ApiResponse(true, "Password changed successfully! You can now login.");
    }

    // ── US012: Restore Account (Admin) ──────────────────────────────────────────
    @Transactional
    public ApiResponse restoreAccount(String email) {
        Login login = loginRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        login.setStatus("Active");
        loginRepository.save(login);
        return new ApiResponse(true, "Account restored successfully");
    }

    // ── Admin: Get all customers ───────────────────────────────────────────────
    public ApiResponse getAllCustomers() {
        return new ApiResponse(true, "Customers fetched", customerRepository.findAll());
    }
}
