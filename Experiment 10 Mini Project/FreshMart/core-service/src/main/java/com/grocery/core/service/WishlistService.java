package com.grocery.core.service;

import com.grocery.core.dto.ApiResponse;
import com.grocery.core.model.*;
import com.grocery.core.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class WishlistService {

    @Autowired private WishlistRepository wishlistRepository;
    @Autowired private CustomerRepository  customerRepository;
    @Autowired private ProductRepository   productRepository;

    public ApiResponse getWishlist(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        return new ApiResponse(true, "Wishlist fetched", wishlistRepository.findByCustomer(customer));
    }

    public ApiResponse toggle(Integer customerId, Integer productId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        return wishlistRepository.findByCustomerAndProduct(customer, product)
                .map(w -> {
                    wishlistRepository.delete(w);
                    return new ApiResponse(true, "Removed from wishlist", false);
                })
                .orElseGet(() -> {
                    Wishlist w = new Wishlist();
                    w.setCustomer(customer);
                    w.setProduct(product);
                    wishlistRepository.save(w);
                    return new ApiResponse(true, "Added to wishlist", true);
                });
    }

    public ApiResponse isWishlisted(Integer customerId, Integer productId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));
        boolean exists = wishlistRepository.existsByCustomerAndProduct(customer, product);
        return new ApiResponse(true, "Checked", exists);
    }
}
