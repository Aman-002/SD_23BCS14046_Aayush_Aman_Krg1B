package com.grocery.core.controller;

import com.grocery.core.dto.ApiResponse;
import com.grocery.core.model.Coupon;
import com.grocery.core.service.CouponService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/coupons")
public class CouponController {

    @Autowired private CouponService couponService;

    /** POST /api/coupons/validate?code=SAVE20&total=600 */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse> validate(@RequestParam String code,
                                                @RequestParam Double total) {
        try { return ResponseEntity.ok(couponService.validate(code, total)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage())); }
    }

    // ── Admin ─────────────────────────────────────────────────────────────────
    @GetMapping("/all")
    public ResponseEntity<ApiResponse> getAll() {
        try { return ResponseEntity.ok(couponService.getAll()); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage())); }
    }

    @PostMapping
    public ResponseEntity<ApiResponse> create(@RequestBody Coupon coupon) {
        try { return ResponseEntity.status(HttpStatus.CREATED).body(couponService.create(coupon)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage())); }
    }

    @PutMapping("/toggle/{id}")
    public ResponseEntity<ApiResponse> toggle(@PathVariable Integer id) {
        try { return ResponseEntity.ok(couponService.toggle(id)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage())); }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> delete(@PathVariable Integer id) {
        try { return ResponseEntity.ok(couponService.delete(id)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage())); }
    }
}
