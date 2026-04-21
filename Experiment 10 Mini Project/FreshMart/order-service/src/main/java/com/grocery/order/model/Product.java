package com.grocery.order.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

@Entity
@Table(name = "product")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer productId;

    @NotBlank(message = "Product name cannot be blank")
    @Column(name = "product_name", nullable = false, length = 100)
    private String productName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "company_name", length = 100)
    private String companyName;

    @Column(length = 50)
    private String category = "General";

    @DecimalMax(value = "10000.00", message = "Price must not exceed 10000")
    @Column(nullable = false)
    private Double price;

    @Column(nullable = false)
    private Integer stock = 0;

    @Column(nullable = false)
    private Integer discount = 0;

    @Column(name = "image_url", length = 500)
    private String imageUrl;
}
