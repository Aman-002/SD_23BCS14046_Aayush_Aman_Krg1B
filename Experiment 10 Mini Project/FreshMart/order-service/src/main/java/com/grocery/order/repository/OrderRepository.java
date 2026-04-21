package com.grocery.order.repository;

import com.grocery.order.model.Order;
import com.grocery.order.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OrderRepository extends JpaRepository<Order, String> {
    List<Order> findByCustomerOrderByOrderDateDesc(Customer customer);
}
