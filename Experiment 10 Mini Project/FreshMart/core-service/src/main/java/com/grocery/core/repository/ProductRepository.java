package com.grocery.core.repository;

import com.grocery.core.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductRepository extends JpaRepository<Product, Integer> {
    List<Product> findByProductNameContainingIgnoreCase(String name);
}
