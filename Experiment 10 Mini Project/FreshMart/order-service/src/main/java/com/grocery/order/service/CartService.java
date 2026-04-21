package com.grocery.order.service;

import com.grocery.order.dto.ApiResponse;
import com.grocery.order.model.*;
import com.grocery.order.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class CartService {

    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private ProductRepository productRepository;

    // ── US006: Add to cart ────────────────────────────────────────────────────
    @Transactional
    public ApiResponse addToCart(Integer customerId, Integer productId, Integer quantity) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (product.getStock() < quantity)
            throw new RuntimeException("Insufficient stock");

        Optional<CartItem> existing =
                cartItemRepository.findByCustomerAndProduct_ProductId(customer, productId);

        if (existing.isPresent()) {
            CartItem item = existing.get();
            item.setQuantity(item.getQuantity() + quantity);
            cartItemRepository.save(item);
        } else {
            CartItem item = new CartItem();
            item.setCustomer(customer);
            item.setProduct(product);
            item.setQuantity(quantity);
            cartItemRepository.save(item);
        }
        return new ApiResponse(true, "Item added to cart");
    }

    // ── US007: Update cart item quantity ──────────────────────────────────────
    @Transactional
    public ApiResponse updateCartItem(Integer cartItemId, Integer quantity) {
        CartItem item = cartItemRepository.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));
        if (quantity <= 0) {
            cartItemRepository.delete(item);
            return new ApiResponse(true, "Item removed from cart");
        }
        item.setQuantity(quantity);
        cartItemRepository.save(item);
        return new ApiResponse(true, "Cart updated", item);
    }

    // ── Get cart ──────────────────────────────────────────────────────────────
    public ApiResponse getCart(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        List<CartItem> items = cartItemRepository.findByCustomer(customer);
        return new ApiResponse(true, "Cart fetched", items);
    }

    // ── Remove single item ────────────────────────────────────────────────────
    @Transactional
    public ApiResponse removeCartItem(Integer cartItemId) {
        cartItemRepository.deleteById(cartItemId);
        return new ApiResponse(true, "Item removed from cart");
    }
}
