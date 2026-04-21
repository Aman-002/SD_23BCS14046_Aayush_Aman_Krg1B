package com.grocery.core.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "customer_name", length = 100)
    private String customerName;

    @Column(name = "customer_email", length = 100)
    private String customerEmail;

    @Column(nullable = false)
    private Integer rating;          // 1 – 5

    @Column(nullable = false, columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();
}
