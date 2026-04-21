package com.grocery.order.repository;

import com.grocery.order.model.CartItem;
import com.grocery.order.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Integer> {
    List<CartItem> findByCustomer(Customer customer);

    Optional<CartItem> findByCustomerAndProduct_ProductId(Customer customer, Integer productId);

    void deleteByCustomer(Customer customer);
}
