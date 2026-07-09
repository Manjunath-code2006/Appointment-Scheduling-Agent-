package com.appointmentagent.repository;

import com.appointmentagent.entity.Provider;
import com.appointmentagent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {

    Optional<Provider> findByUser(User user);

    Optional<Provider> findByUserId(Long userId);

    List<Provider> findByActiveTrue();

    @Query("SELECT p FROM Provider p JOIN p.services s WHERE s.id = :serviceId AND p.active = true")
    List<Provider> findByServiceId(@Param("serviceId") Long serviceId);
}
