package com.appointmentagent.repository;

import com.appointmentagent.entity.AppSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AppSettingsRepository extends JpaRepository<AppSettings, Long> {
    // Singleton settings — always fetch the first record
    Optional<AppSettings> findFirstByOrderByIdAsc();
}
