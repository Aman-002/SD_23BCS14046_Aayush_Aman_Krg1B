package com.grocery.order.service;

import com.grocery.order.dto.ApiResponse;
import com.grocery.order.dto.PaymentRequest;
import com.grocery.order.model.*;
import com.grocery.order.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;

@Service
public class PaymentService {

    private static final double COD_LIMIT = 1000.0;

    @Autowired private OrderRepository      orderRepository;
    @Autowired private CustomerRepository   customerRepository;
    @Autowired private CartItemRepository   cartItemRepository;
    @Autowired private ProductRepository    productRepository;
    @Autowired private CouponRepository     couponRepository;
    @Autowired private OrderEmailService    orderEmailService;

    public ApiResponse previewOrder(Integer customerId, String paymentMethod) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        List<CartItem> cartItems = cartItemRepository.findByCustomer(customer);
        if (cartItems.isEmpty()) throw new RuntimeException("Cart is empty.");

        double total = calculateTotal(cartItems);

        if ("COD".equalsIgnoreCase(paymentMethod) && total > COD_LIMIT)
            throw new RuntimeException(
                "Cash on Delivery is not available for orders above ₹" + (int) COD_LIMIT + ".");

        Map<String, Object> data = new HashMap<>();
        data.put("total",        total);
        data.put("itemCount",    cartItems.size());
        data.put("codAvailable", total <= COD_LIMIT);
        data.put("codLimit",     COD_LIMIT);
        return new ApiResponse(true, "Preview ready", data);
    }

    @Transactional
    public ApiResponse processPayment(PaymentRequest req) {
        Customer customer = customerRepository.findById(req.getCustomerId())
                .orElseThrow(() -> new RuntimeException("Customer not found"));
        List<CartItem> cartItems = cartItemRepository.findByCustomer(customer);
        if (cartItems.isEmpty()) throw new RuntimeException("Cart is empty.");

        double total  = calculateTotal(cartItems);
        String method = req.getPaymentMethod();

        if ("COD".equalsIgnoreCase(method) && total > COD_LIMIT)
            throw new RuntimeException(
                "Cash on Delivery is not available for orders above ₹" + (int) COD_LIMIT + ".");

        // ── Apply coupon if provided ──────────────────────────────────────────
        String appliedCoupon = null;
        double discountAmount = 0;
        if (req.getCouponCode() != null && !req.getCouponCode().isBlank()) {
            String code = req.getCouponCode().toUpperCase();
            Optional<Coupon> couponOpt = couponRepository.findByCode(code);
            if (couponOpt.isPresent()) {
                Coupon coupon = couponOpt.get();
                if (coupon.getIsActive()
                        && coupon.getUsedCount() < coupon.getMaxUses()
                        && (coupon.getExpiryDate() == null || !coupon.getExpiryDate().isBefore(LocalDate.now()))
                        && total >= coupon.getMinOrderAmount()) {
                    discountAmount = total * coupon.getDiscountPercent() / 100.0;
                    total         = total - discountAmount;
                    coupon.setUsedCount(coupon.getUsedCount() + 1);
                    couponRepository.save(coupon);
                    appliedCoupon = code;
                }
            }
        }

        validatePaymentDetails(req, method);

        for (CartItem ci : cartItems)
            if (ci.getProduct().getStock() < ci.getQuantity())
                throw new RuntimeException("Insufficient stock for: " + ci.getProduct().getProductName());

        String txnId     = generateTxnId(method);
        String payStatus = "COD".equalsIgnoreCase(method) ? "COD" : "Paid";

        String orderId = "ORD-" + System.currentTimeMillis();
        Order order = new Order();
        order.setOrderId(orderId);
        order.setCustomer(customer);
        order.setTotal(total);
        order.setStatus("Placed");
        order.setPaymentMethod(method);
        order.setPaymentStatus(payStatus);
        order.setTransactionId(txnId);

        List<OrderItem> orderItems = new ArrayList<>();
        for (CartItem ci : cartItems) {
            Product p = ci.getProduct();
            p.setStock(p.getStock() - ci.getQuantity());
            productRepository.save(p);
            double effective = p.getPrice() * (1 - p.getDiscount() / 100.0);
            OrderItem oi = new OrderItem();
            oi.setOrder(order); oi.setProduct(p);
            oi.setQuantity(ci.getQuantity()); oi.setPrice(effective);
            orderItems.add(oi);
        }
        order.setItems(orderItems);
        orderRepository.save(order);
        cartItemRepository.deleteByCustomer(customer);

        // Send order confirmation email asynchronously or synchronously
        orderEmailService.sendOrderConfirmation(customer.getEmail(), customer.getName(), orderId, total);

        Map<String, Object> result = new HashMap<>();
        result.put("orderId",        orderId);
        result.put("transactionId",  txnId);
        result.put("paymentMethod",  method);
        result.put("paymentStatus",  payStatus);
        result.put("total",          total);
        result.put("discountAmount", discountAmount);
        result.put("couponApplied",  appliedCoupon);

        String msg = "COD".equalsIgnoreCase(method)
            ? "Order placed! Pay ₹" + String.format("%.2f", total) + " on delivery. Order ID: " + orderId
            : "Payment successful! Order ID: " + orderId
              + (appliedCoupon != null ? " | Coupon " + appliedCoupon + " saved ₹" + String.format("%.2f", discountAmount) : "");

        return new ApiResponse(true, msg, result);
    }

    private double calculateTotal(List<CartItem> cartItems) {
        return cartItems.stream().mapToDouble(ci -> {
            Product p = ci.getProduct();
            return p.getPrice() * (1 - p.getDiscount() / 100.0) * ci.getQuantity();
        }).sum();
    }

    private void validatePaymentDetails(PaymentRequest req, String method) {
        switch (method.toUpperCase()) {
            case "UPI" -> {
                if (req.getUpiId() == null || req.getUpiId().isBlank())
                    throw new RuntimeException("UPI ID is required.");
                if (!req.getUpiId().matches("^[\\w.]+@[\\w]+$"))
                    throw new RuntimeException("Invalid UPI ID. Example: name@upi");
            }
            case "CARD" -> {
                if (req.getCardNumber() == null || req.getCardNumber().replaceAll("\\s","").length() != 16)
                    throw new RuntimeException("Card number must be 16 digits.");
                if (req.getCardHolder() == null || req.getCardHolder().isBlank())
                    throw new RuntimeException("Cardholder name is required.");
                if (req.getExpiry() == null || !req.getExpiry().matches("^(0[1-9]|1[0-2])/\\d{2}$"))
                    throw new RuntimeException("Expiry must be MM/YY.");
                if (req.getCvv() == null || !req.getCvv().matches("^\\d{3}$"))
                    throw new RuntimeException("CVV must be 3 digits.");
            }
            case "COD" -> {}
            default -> throw new RuntimeException("Invalid payment method. Choose UPI, CARD, or COD.");
        }
    }

    private String generateTxnId(String method) {
        String prefix = switch (method.toUpperCase()) {
            case "UPI"  -> "UPI";
            case "CARD" -> "CARD";
            default     -> "COD";
        };
        return prefix + "-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 9000 + 1000);
    }
}
