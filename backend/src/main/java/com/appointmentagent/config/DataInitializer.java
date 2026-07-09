package com.appointmentagent.config;

import com.appointmentagent.entity.*;
import com.appointmentagent.entity.Appointment.AppointmentStatus;
import com.appointmentagent.entity.Appointment.AppointmentType;
import com.appointmentagent.entity.Role.RoleName;
import com.appointmentagent.entity.ServiceType.AppointmentMode;
import com.appointmentagent.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Arrays;
import java.util.Set;

/**
 * Seeds demo data when running with the "dev" profile (H2 in-memory database).
 * This replaces Flyway V2 seed data for local development.
 */
@Configuration
@RequiredArgsConstructor
@Slf4j
@Profile("dev")
public class DataInitializer {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final ProviderRepository providerRepository;
    private final ServiceTypeRepository serviceTypeRepository;
    private final WorkingHoursRepository workingHoursRepository;
    private final AppSettingsRepository appSettingsRepository;
    private final AppointmentRepository appointmentRepository;
    private final PasswordEncoder passwordEncoder;

    @Bean
    CommandLineRunner seedData() {
        return args -> {
            if (roleRepository.count() > 0) {
                log.info("Database already seeded — skipping.");
                return;
            }

            log.info("Seeding demo data...");

            // ── Roles ──────────────────────────────────────────────────────────
            Role adminRole    = roleRepository.save(Role.builder().name(RoleName.ROLE_ADMIN).build());
            Role customerRole = roleRepository.save(Role.builder().name(RoleName.ROLE_CUSTOMER).build());
            Role providerRole = roleRepository.save(Role.builder().name(RoleName.ROLE_PROVIDER).build());

            // ── Users ──────────────────────────────────────────────────────────
            // Admin  (password: Admin@1234)
            User admin = userRepository.save(User.builder()
                    .firstName("System").lastName("Admin")
                    .email("admin@appointmentagent.com")
                    .password(passwordEncoder.encode("Admin@1234"))
                    .phone("+1234567890")
                    .enabled(true).emailVerified(true)
                    .roles(Set.of(adminRole))
                    .build());

            // Customers  (password: Customer@1234)
            User jane = userRepository.save(User.builder()
                    .firstName("Jane").lastName("Smith")
                    .email("jane.smith@example.com")
                    .password(passwordEncoder.encode("Customer@1234"))
                    .phone("+1987654321")
                    .enabled(true).emailVerified(true)
                    .roles(Set.of(customerRole))
                    .build());

            User bob = userRepository.save(User.builder()
                    .firstName("Bob").lastName("Johnson")
                    .email("bob.johnson@example.com")
                    .password(passwordEncoder.encode("Customer@1234"))
                    .phone("+1122334455")
                    .enabled(true).emailVerified(true)
                    .roles(Set.of(customerRole))
                    .build());

            // Provider users  (password: Provider@1234)
            User drSarah = userRepository.save(User.builder()
                    .firstName("Dr. Sarah").lastName("Williams")
                    .email("sarah.williams@appointmentagent.com")
                    .password(passwordEncoder.encode("Provider@1234"))
                    .phone("+1555000001")
                    .enabled(true).emailVerified(true)
                    .roles(Set.of(providerRole))
                    .build());

            User drMichael = userRepository.save(User.builder()
                    .firstName("Dr. Michael").lastName("Brown")
                    .email("michael.brown@appointmentagent.com")
                    .password(passwordEncoder.encode("Provider@1234"))
                    .phone("+1555000002")
                    .enabled(true).emailVerified(true)
                    .roles(Set.of(providerRole))
                    .build());

            // ── Services ───────────────────────────────────────────────────────
            ServiceType consultation = serviceTypeRepository.save(ServiceType.builder()
                    .name("General Consultation").description("General health consultation")
                    .durationMinutes(30).price(new BigDecimal("50.00"))
                    .color("#3B82F6").mode(AppointmentMode.OFFLINE).active(true).build());

            ServiceType dental = serviceTypeRepository.save(ServiceType.builder()
                    .name("Dental Checkup").description("Routine dental examination")
                    .durationMinutes(45).price(new BigDecimal("80.00"))
                    .color("#10B981").mode(AppointmentMode.OFFLINE).active(true).build());

            ServiceType videoConsult = serviceTypeRepository.save(ServiceType.builder()
                    .name("Video Consultation").description("Online video consultation")
                    .durationMinutes(30).price(new BigDecimal("40.00"))
                    .color("#8B5CF6").mode(AppointmentMode.VIDEO).active(true).build());

            ServiceType physio = serviceTypeRepository.save(ServiceType.builder()
                    .name("Physical Therapy").description("Physical therapy session")
                    .durationMinutes(60).price(new BigDecimal("90.00"))
                    .color("#F59E0B").mode(AppointmentMode.OFFLINE).active(true).build());

            ServiceType nutrition = serviceTypeRepository.save(ServiceType.builder()
                    .name("Nutrition Counseling").description("Dietary and nutrition guidance")
                    .durationMinutes(45).price(new BigDecimal("60.00"))
                    .color("#EC4899").mode(AppointmentMode.OFFLINE).active(true).build());

            // ── Providers ─────────────────────────────────────────────────────
            Provider provider1 = providerRepository.save(Provider.builder()
                    .user(drSarah)
                    .specialization("General Medicine")
                    .bio("Dr. Sarah Williams has 10+ years of experience in general medicine.")
                    .location("Room 101, Main Building")
                    .bufferMinutes(5).maxAppointmentsPerDay(16)
                    .services(Set.of(consultation, videoConsult, physio))
                    .active(true).build());

            Provider provider2 = providerRepository.save(Provider.builder()
                    .user(drMichael)
                    .specialization("Dental & Oral Health")
                    .bio("Dr. Michael Brown specializes in preventive dental care.")
                    .location("Room 205, Dental Wing")
                    .bufferMinutes(10).maxAppointmentsPerDay(12)
                    .services(Set.of(dental, nutrition))
                    .active(true).build());

            // ── Working Hours for Provider 1 ───────────────────────────────────
            Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).forEach(day ->
                workingHoursRepository.save(WorkingHours.builder()
                    .provider(provider1).dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(17, 0))
                    .lunchStart(LocalTime.of(12, 0)).lunchEnd(LocalTime.of(13, 0))
                    .isWorking(true).build())
            );
            Arrays.asList(DayOfWeek.SATURDAY, DayOfWeek.SUNDAY).forEach(day ->
                workingHoursRepository.save(WorkingHours.builder()
                    .provider(provider1).dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(17, 0))
                    .isWorking(false).build())
            );

            // ── Working Hours for Provider 2 ───────────────────────────────────
            Arrays.asList(DayOfWeek.MONDAY, DayOfWeek.TUESDAY, DayOfWeek.WEDNESDAY,
                    DayOfWeek.THURSDAY, DayOfWeek.FRIDAY).forEach(day ->
                workingHoursRepository.save(WorkingHours.builder()
                    .provider(provider2).dayOfWeek(day)
                    .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(18, 0))
                    .lunchStart(LocalTime.of(13, 0)).lunchEnd(LocalTime.of(14, 0))
                    .isWorking(true).build())
            );
            workingHoursRepository.save(WorkingHours.builder()
                .provider(provider2).dayOfWeek(DayOfWeek.SATURDAY)
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(13, 0))
                .isWorking(true).build());
            workingHoursRepository.save(WorkingHours.builder()
                .provider(provider2).dayOfWeek(DayOfWeek.SUNDAY)
                .startTime(LocalTime.of(9, 0)).endTime(LocalTime.of(17, 0))
                .isWorking(false).build());

            // ── App Settings ───────────────────────────────────────────────────
            appSettingsRepository.save(AppSettings.builder()
                    .businessName("Appointment Agent")
                    .businessEmail("contact@appointmentagent.com")
                    .timezone("UTC")
                    .defaultAppointmentDuration(30)
                    .slotIntervalMinutes(30)
                    .officeStartTime(LocalTime.of(9, 0))
                    .officeEndTime(LocalTime.of(17, 0))
                    .maxAdvanceBookingDays(60)
                    .minCancellationHours(24)
                    .reminderHoursBefore(24)
                    .emailNotificationsEnabled(true)
                    .build());

            // ── Sample Appointments ────────────────────────────────────────────
            LocalDate tomorrow = LocalDate.now().plusDays(1);
            LocalDate nextWeek = LocalDate.now().plusDays(7);

            // Find a working day for tomorrow
            WorkingHours tomorrowWh = workingHoursRepository
                    .findByProviderAndDayOfWeek(provider1, tomorrow.getDayOfWeek())
                    .orElse(null);

            if (tomorrowWh != null && tomorrowWh.isWorking()) {
                appointmentRepository.save(Appointment.builder()
                        .appointmentNumber("APT-DEMO-001")
                        .customer(jane).provider(provider1).service(consultation)
                        .appointmentDate(tomorrow)
                        .startTime(LocalTime.of(10, 0)).endTime(LocalTime.of(10, 30))
                        .status(AppointmentStatus.CONFIRMED)
                        .type(AppointmentType.REGULAR)
                        .notes("Annual checkup")
                        .build());
            }

            appointmentRepository.save(Appointment.builder()
                    .appointmentNumber("APT-DEMO-002")
                    .customer(bob).provider(provider2).service(dental)
                    .appointmentDate(nextWeek)
                    .startTime(LocalTime.of(14, 0)).endTime(LocalTime.of(14, 45))
                    .status(AppointmentStatus.CONFIRMED)
                    .type(AppointmentType.REGULAR)
                    .build());

            appointmentRepository.save(Appointment.builder()
                    .appointmentNumber("APT-DEMO-003")
                    .customer(jane).provider(provider1).service(videoConsult)
                    .appointmentDate(LocalDate.now().minusDays(3))
                    .startTime(LocalTime.of(11, 0)).endTime(LocalTime.of(11, 30))
                    .status(AppointmentStatus.COMPLETED)
                    .type(AppointmentType.REGULAR)
                    .meetingLink("https://meet.google.com/demo-link")
                    .meetingPlatform(Appointment.MeetingPlatform.GOOGLE_MEET)
                    .build());

            log.info("Demo data seeded successfully. Admin: admin@appointmentagent.com / Admin@1234");
        };
    }
}
