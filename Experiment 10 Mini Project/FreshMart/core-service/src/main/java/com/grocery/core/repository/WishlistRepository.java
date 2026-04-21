package com.grocery.core.repository;

import com.grocery.core.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<Wishlist, Integer> {
    List<Wishlist> findByCustomer(Customer customer);
    Optional<Wishlist> findByCustomerAndProduct(Customer customer, Product product);
    boolean existsByCustomerAndProduct(Customer customer, Product product);
}
