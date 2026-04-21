package com.grocery.core.controller;

import com.grocery.core.dto.ApiResponse;
import com.grocery.core.service.WishlistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
public class WishlistController {

    @Autowired private WishlistService wishlistService;

    @GetMapping("/{customerId}")
    public ResponseEntity<ApiResponse> get(@PathVariable Integer customerId) {
        try { return ResponseEntity.ok(wishlistService.getWishlist(customerId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage())); }
    }

    @PostMapping("/toggle")
    public ResponseEntity<ApiResponse> toggle(@RequestParam Integer customerId,
                                               @RequestParam Integer productId) {
        try { return ResponseEntity.ok(wishlistService.toggle(customerId, productId)); }
        catch (Exception e) { return ResponseEntity.badRequest().body(new ApiResponse(false, e.getMessage())); }
    }
}
