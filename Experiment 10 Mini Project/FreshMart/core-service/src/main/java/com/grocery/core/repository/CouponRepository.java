package com.grocery.core.repository;

import com.grocery.core.model.Coupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface CouponRepository extends JpaRepository<Coupon, Integer> {
    Optional<Coupon> findByCode(String code);
}
