package com.grocery.order.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "customer")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Integer customerId;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Column(length = 15)
    private String contact;

    @Column(columnDefinition = "TEXT")
    private String address;

    @OneToOne
    @JoinColumn(name = "login_id", nullable = false)
    private Login login;
}
