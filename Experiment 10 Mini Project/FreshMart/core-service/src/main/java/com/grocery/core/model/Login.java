package com.grocery.core.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "login")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Login {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "login_id")
    private Integer loginId;

    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "user_type", nullable = false)
    private String userType; // Admin | Customer

    @Column(nullable = false)
    private String status = "Active"; // Active | Inactive
}
