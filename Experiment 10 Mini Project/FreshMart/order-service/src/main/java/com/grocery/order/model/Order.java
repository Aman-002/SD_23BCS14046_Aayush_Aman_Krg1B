package com.grocery.order.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {

    @Id
    @Column(name = "order_id", length = 50)
    private String orderId;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    private Double total;

    @Column(nullable = false)
    private String status = "Placed";

    @Column(name = "order_date")
    private LocalDateTime orderDate = LocalDateTime.now();

    // ── Payment fields ────────────────────────────────────────────────────────
    @Column(name = "payment_method", length = 10)
    private String paymentMethod;   // UPI | CARD | COD

    @Column(name = "payment_status", length = 20)
    private String paymentStatus;   // Paid | COD

    @Column(name = "transaction_id", length = 60)
    private String transactionId;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.EAGER)
    private List<OrderItem> items;
}
