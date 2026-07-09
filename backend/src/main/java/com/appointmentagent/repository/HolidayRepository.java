package com.appointmentagent.repository;

import com.appointmentagent.entity.Holiday;
import com.appointmentagent.entity.Provider;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface HolidayRepository extends JpaRepository<Holiday, Long> {

    List<Holiday> findByProviderIsNull();

    List<Holiday> findByProvider(Provider provider);

    @Query("SELECT h FROM Holiday h WHERE h.date = :date AND (h.provider IS NULL OR h.provider = :provider)")
    List<Holiday> findByDateAndProviderOrGlobal(@Param("date") LocalDate date, @Param("provider") Provider provider);

    @Query("SELECT h FROM Holiday h WHERE h.date BETWEEN :start AND :end AND (h.provider IS NULL OR h.provider = :provider)")
    List<Holiday> findByDateRangeAndProvider(
            @Param("start") LocalDate start,
            @Param("end") LocalDate end,
            @Param("provider") Provider provider
    );

    boolean existsByDateAndProviderIsNull(LocalDate date);
}
