package com.appointmentagent.repository;

import com.appointmentagent.entity.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServiceTypeRepository extends JpaRepository<ServiceType, Long> {

    List<ServiceType> findByActiveTrue();

    boolean existsByNameIgnoreCase(String name);
}
