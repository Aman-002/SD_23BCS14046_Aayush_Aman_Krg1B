package com.grocery.order.repository;

import com.grocery.order.model.Customer;
import com.grocery.order.model.Login;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CustomerRepository extends JpaRepository<Customer, Integer> {
    Optional<Customer> findByLogin(Login login);
    Optional<Customer> findByEmail(String email);
}
