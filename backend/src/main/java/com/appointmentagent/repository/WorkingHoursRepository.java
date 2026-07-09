package com.appointmentagent.repository;

import com.appointmentagent.entity.Provider;
import com.appointmentagent.entity.WorkingHours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.DayOfWeek;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkingHoursRepository extends JpaRepository<WorkingHours, Long> {

    List<WorkingHours> findByProvider(Provider provider);

    Optional<WorkingHours> findByProviderAndDayOfWeek(Provider provider, DayOfWeek dayOfWeek);

    List<WorkingHours> findByProviderAndIsWorkingTrue(Provider provider);
}
