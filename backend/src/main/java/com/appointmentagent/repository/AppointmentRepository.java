package com.appointmentagent.repository;

import com.appointmentagent.entity.Appointment;
import com.appointmentagent.entity.Appointment.AppointmentStatus;
import com.appointmentagent.entity.Provider;
import com.appointmentagent.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, Long>, JpaSpecificationExecutor<Appointment> {

    Optional<Appointment> findByAppointmentNumber(String appointmentNumber);

    List<Appointment> findByCustomerOrderByAppointmentDateDescStartTimeDesc(User customer);

    List<Appointment> findByProviderAndAppointmentDate(Provider provider, LocalDate date);

    List<Appointment> findByCustomerAndStatus(User customer, AppointmentStatus status);

    List<Appointment> findByAppointmentDateBetween(LocalDate start, LocalDate end);

    @Query("SELECT a FROM Appointment a WHERE a.provider = :provider AND a.appointmentDate = :date " +
            "AND a.status NOT IN ('CANCELLED', 'NO_SHOW') " +
            "AND ((a.startTime < :endTime AND a.endTime > :startTime))")
    List<Appointment> findConflicting(
            @Param("provider") Provider provider,
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.provider = :provider " +
            "AND a.appointmentDate = :date AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    long countByProviderAndDate(@Param("provider") Provider provider, @Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.status = 'CONFIRMED' " +
            "AND a.reminderSent = false " +
            "AND a.appointmentDate = :date " +
            "AND a.startTime BETWEEN :startTime AND :endTime")
    List<Appointment> findUpcomingReminders(
            @Param("date") LocalDate date,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.status = :status")
    long countByStatus(@Param("status") AppointmentStatus status);

    @Query("SELECT COUNT(a) FROM Appointment a WHERE a.appointmentDate = :date " +
            "AND a.status NOT IN ('CANCELLED', 'NO_SHOW')")
    long countByDate(@Param("date") LocalDate date);

    @Query("SELECT a FROM Appointment a WHERE a.appointmentDate BETWEEN :start AND :end " +
            "ORDER BY a.appointmentDate ASC, a.startTime ASC")
    List<Appointment> findByDateRange(@Param("start") LocalDate start, @Param("end") LocalDate end);

    @Query("SELECT a FROM Appointment a WHERE a.customer.id = :customerId " +
            "AND a.appointmentDate >= :today AND a.status = 'CONFIRMED' " +
            "ORDER BY a.appointmentDate ASC, a.startTime ASC")
    List<Appointment> findUpcomingByCustomer(@Param("customerId") Long customerId, @Param("today") LocalDate today);

    @Query("SELECT a FROM Appointment a WHERE a.provider.id = :providerId " +
            "AND a.appointmentDate >= :today AND a.status = 'CONFIRMED' " +
            "ORDER BY a.appointmentDate ASC, a.startTime ASC")
    List<Appointment> findUpcomingByProvider(@Param("providerId") Long providerId, @Param("today") LocalDate today);

    @Query("SELECT MONTH(a.appointmentDate), COUNT(a) FROM Appointment a " +
            "WHERE YEAR(a.appointmentDate) = :year GROUP BY MONTH(a.appointmentDate)")
    List<Object[]> countByMonthAndYear(@Param("year") int year);

    @Query("SELECT a.service.name, COUNT(a) FROM Appointment a GROUP BY a.service.name ORDER BY COUNT(a) DESC")
    List<Object[]> countByService();
}
