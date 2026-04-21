package com.grocery.order.repository;

import com.grocery.order.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByProductNameContainingIgnoreCase(String name);
}
