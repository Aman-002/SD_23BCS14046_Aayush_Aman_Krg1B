package com.grocery.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wishlist",
    uniqueConstraints = @UniqueConstraint(columnNames = {"customer_id","product_id"}))
@Data @NoArgsConstructor @AllArgsConstructor
public class Wishlist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;

    @Column(name = "added_at")
    private LocalDateTime addedAt = LocalDateTime.now();
}
