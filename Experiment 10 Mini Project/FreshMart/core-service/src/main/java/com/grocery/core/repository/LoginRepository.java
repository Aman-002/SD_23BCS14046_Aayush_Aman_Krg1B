// ===== LoginRepository.java =====
package com.grocery.core.repository;

import com.grocery.core.model.Login;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface LoginRepository extends JpaRepository<Login, Integer> {
    Optional<Login> findByEmail(String email);
    boolean existsByEmail(String email);
}
