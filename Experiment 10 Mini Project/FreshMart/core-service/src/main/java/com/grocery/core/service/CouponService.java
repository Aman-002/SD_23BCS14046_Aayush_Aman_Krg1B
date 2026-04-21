package com.grocery.core.service;

import com.grocery.core.dto.ApiResponse;
import com.grocery.core.model.Coupon;
import com.grocery.core.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
public class CouponService {

    @Autowired private CouponRepository couponRepository;

    /** Validate a coupon code against the cart total */
    public ApiResponse validate(String code, Double cartTotal) {
        Coupon coupon = couponRepository.findByCode(code.toUpperCase())
                .orElseThrow(() -> new RuntimeException("Coupon code '" + code + "' is invalid."));

        if (!coupon.getIsActive())
            throw new RuntimeException("This coupon is no longer active.");
        if (coupon.getUsedCount() >= coupon.getMaxUses())
            throw new RuntimeException("This coupon has reached its usage limit.");
        if (coupon.getExpiryDate() != null && coupon.getExpiryDate().isBefore(LocalDate.now()))
            throw new RuntimeException("This coupon has expired.");
        if (cartTotal < coupon.getMinOrderAmount())
            throw new RuntimeException("Minimum order amount for this coupon is ₹"
                + coupon.getMinOrderAmount().intValue() + ".");

        double discount = cartTotal * coupon.getDiscountPercent() / 100.0;
        double finalTotal = cartTotal - discount;

        Map<String, Object> data = new HashMap<>();
        data.put("code",            coupon.getCode());
        data.put("discountPercent", coupon.getDiscountPercent());
        data.put("discountAmount",  discount);
        data.put("finalTotal",      finalTotal);

        return new ApiResponse(true,
            "Coupon applied! You save ₹" + String.format("%.2f", discount), data);
    }

    /** Increment usage count when an order using this coupon is placed */
    public void markUsed(String code) {
        couponRepository.findByCode(code.toUpperCase()).ifPresent(c -> {
            c.setUsedCount(c.getUsedCount() + 1);
            couponRepository.save(c);
        });
    }

    // ── Admin methods ─────────────────────────────────────────────────────────
    public ApiResponse getAll() {
        return new ApiResponse(true, "All coupons", couponRepository.findAll());
    }

    public ApiResponse create(Coupon coupon) {
        coupon.setCode(coupon.getCode().toUpperCase());
        if (couponRepository.findByCode(coupon.getCode()).isPresent())
            throw new RuntimeException("Coupon code already exists.");
        return new ApiResponse(true, "Coupon created", couponRepository.save(coupon));
    }

    public ApiResponse toggle(Integer id) {
        Coupon c = couponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Coupon not found"));
        c.setIsActive(!c.getIsActive());
        couponRepository.save(c);
        return new ApiResponse(true,
            "Coupon " + (c.getIsActive() ? "activated" : "deactivated"), c);
    }

    public ApiResponse delete(Integer id) {
        couponRepository.deleteById(id);
        return new ApiResponse(true, "Coupon deleted", null);
    }
}
