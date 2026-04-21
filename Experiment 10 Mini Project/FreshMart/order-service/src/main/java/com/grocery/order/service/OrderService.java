package com.grocery.order.service;

import com.grocery.order.dto.ApiResponse;
import com.grocery.order.model.*;
import com.grocery.order.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;

@Service
public class OrderService {

    @Autowired private OrderRepository    orderRepository;
    @Autowired private CustomerRepository customerRepository;
    @Autowired private CartItemRepository cartItemRepository;
    @Autowired private ProductRepository  productRepository;

    // ── Place order ───────────────────────────────────────────────────────────
    @Transactional
    public ApiResponse placeOrder(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));

        List<CartItem> cartItems = cartItemRepository.findByCustomer(customer);
        if (cartItems.isEmpty())
            throw new RuntimeException("Cart is empty. Add items before placing an order.");

        String orderId = "ORD-" + System.currentTimeMillis();
        Order order = new Order();
        order.setOrderId(orderId);
        order.setCustomer(customer);
        order.setStatus("Placed");

        double total = 0;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem ci : cartItems) {
            Product product = ci.getProduct();
            if (product.getStock() < ci.getQuantity())
                throw new RuntimeException("Insufficient stock for: " + product.getProductName());

            product.setStock(product.getStock() - ci.getQuantity());
            productRepository.save(product);

            double effectivePrice = product.getPrice() * (1 - product.getDiscount() / 100.0);
            OrderItem oi = new OrderItem();
            oi.setOrder(order);
            oi.setProduct(product);
            oi.setQuantity(ci.getQuantity());
            oi.setPrice(effectivePrice);
            orderItems.add(oi);
            total += effectivePrice * ci.getQuantity();
        }

        order.setTotal(total);
        order.setItems(orderItems);
        orderRepository.save(order);
        cartItemRepository.deleteByCustomer(customer);

        return new ApiResponse(true, "Order placed successfully! Order ID: " + orderId, order);
    }

    // ── Order history ─────────────────────────────────────────────────────────
    public ApiResponse getOrderHistory(Integer customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        List<Order> orders = orderRepository.findByCustomerOrderByOrderDateDesc(customer);
        return new ApiResponse(true, "Orders fetched", orders);
    }

    // ── Admin: All orders ─────────────────────────────────────────────────────
    public ApiResponse getAllOrders() {
        return new ApiResponse(true, "All orders", orderRepository.findAll());
    }

    // ── Cancel order (within 30 minutes) ─────────────────────────────────────
    @Transactional
    public ApiResponse cancelOrder(String orderId, Integer customerId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found: " + orderId));

        if (!order.getCustomer().getCustomerId().equals(customerId))
            throw new RuntimeException("Unauthorized: This order does not belong to you.");

        if ("Cancelled".equals(order.getStatus()))
            throw new RuntimeException("Order is already cancelled.");

        long minutesElapsed = Duration.between(order.getOrderDate(), LocalDateTime.now()).toMinutes();
        if (minutesElapsed > 30)
            throw new RuntimeException(
                "Orders can only be cancelled within 30 minutes of placing. " +
                "This order was placed " + minutesElapsed + " minutes ago.");

        // Restore stock
        for (OrderItem oi : order.getItems()) {
            Product p = oi.getProduct();
            p.setStock(p.getStock() + oi.getQuantity());
            productRepository.save(p);
        }

        order.setStatus("Cancelled");
        orderRepository.save(order);
        return new ApiResponse(true, "Order " + orderId + " has been cancelled. Stock restored.", order);
    }
}
