package com.grocery.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "coupon")
@Data @NoArgsConstructor @AllArgsConstructor
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Column(name = "discount_percent", nullable = false)
    private Integer discountPercent;

    @Column(name = "min_order_amount", nullable = false)
    private Double minOrderAmount = 0.0;

    @Column(name = "max_uses", nullable = false)
    private Integer maxUses = 100;

    @Column(name = "used_count", nullable = false)
    private Integer usedCount = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "expiry_date")
    private LocalDate expiryDate;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
