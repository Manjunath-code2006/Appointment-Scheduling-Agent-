-- ============================================================
-- V2: Seed initial data
-- ============================================================

-- Roles
INSERT IGNORE INTO roles (name) VALUES ('ROLE_ADMIN'), ('ROLE_CUSTOMER'), ('ROLE_PROVIDER');

-- Admin user  (password: Admin@1234)
INSERT IGNORE INTO users (id, first_name, last_name, email, password, phone, enabled, email_verified)
VALUES (1, 'System', 'Admin', 'admin@appointmentagent.com',
        '$2a$12$9sKNe6GKNkBM4gVq0rQvEuPmLQwWqU7n.z2nmVVVZ.XTW4bBdXkay',
        '+1234567890', 1, 1);

-- Customer users  (password: Customer@1234)
INSERT IGNORE INTO users (id, first_name, last_name, email, password, phone, enabled, email_verified)
VALUES
    (2, 'Jane', 'Smith',   'jane.smith@example.com',
     '$2a$12$vqKFv5m4wsmq.JeaVY/LlO3w3q29fYqJvl0e3FWc5nJ6ZbSrKFuDO',
     '+1987654321', 1, 1),
    (3, 'Bob', 'Johnson',  'bob.johnson@example.com',
     '$2a$12$vqKFv5m4wsmq.JeaVY/LlO3w3q29fYqJvl0e3FWc5nJ6ZbSrKFuDO',
     '+1122334455', 1, 1);

-- Provider users  (password: Provider@1234)
INSERT IGNORE INTO users (id, first_name, last_name, email, password, phone, enabled, email_verified)
VALUES
    (4, 'Dr. Sarah', 'Williams', 'sarah.williams@appointmentagent.com',
     '$2a$12$vqKFv5m4wsmq.JeaVY/LlO3w3q29fYqJvl0e3FWc5nJ6ZbSrKFuDO',
     '+1555000001', 1, 1),
    (5, 'Dr. Michael', 'Brown', 'michael.brown@appointmentagent.com',
     '$2a$12$vqKFv5m4wsmq.JeaVY/LlO3w3q29fYqJvl0e3FWc5nJ6ZbSrKFuDO',
     '+1555000002', 1, 1);

-- Assign roles
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 1, id FROM roles WHERE name = 'ROLE_ADMIN';
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 2, id FROM roles WHERE name = 'ROLE_CUSTOMER';
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 3, id FROM roles WHERE name = 'ROLE_CUSTOMER';
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 4, id FROM roles WHERE name = 'ROLE_PROVIDER';
INSERT IGNORE INTO user_roles (user_id, role_id)
SELECT 5, id FROM roles WHERE name = 'ROLE_PROVIDER';

-- Services
INSERT IGNORE INTO services (id, name, description, duration_minutes, price, color, mode)
VALUES
    (1, 'General Consultation', 'General health consultation with a doctor', 30, 50.00, '#3B82F6', 'OFFLINE'),
    (2, 'Dental Checkup',       'Routine dental examination and cleaning',   45, 80.00, '#10B981', 'OFFLINE'),
    (3, 'Video Consultation',   'Online video consultation',                 30, 40.00, '#8B5CF6', 'VIDEO'),
    (4, 'Physical Therapy',     'Physical therapy session',                  60, 90.00, '#F59E0B', 'OFFLINE'),
    (5, 'Nutrition Counseling', 'Dietary and nutrition guidance session',    45, 60.00, '#EC4899', 'OFFLINE');

-- Providers
INSERT IGNORE INTO providers (id, user_id, specialization, bio, location, buffer_minutes, max_appointments_per_day)
VALUES
    (1, 4, 'General Medicine',
     'Dr. Sarah Williams has 10+ years of experience in general medicine.',
     'Room 101, Main Building', 5, 16),
    (2, 5, 'Dental & Oral Health',
     'Dr. Michael Brown specializes in preventive dental care.',
     'Room 205, Dental Wing', 10, 12);

-- Provider services
INSERT IGNORE INTO provider_services (provider_id, service_id) VALUES (1, 1), (1, 3), (1, 4);
INSERT IGNORE INTO provider_services (provider_id, service_id) VALUES (2, 2), (2, 5);

-- Working hours for Provider 1 (Mon-Fri 9-17, lunch 12-13)
INSERT IGNORE INTO working_hours (provider_id, day_of_week, start_time, end_time, lunch_start, lunch_end, is_working)
VALUES
    (1, 'MONDAY',    '09:00:00', '17:00:00', '12:00:00', '13:00:00', 1),
    (1, 'TUESDAY',   '09:00:00', '17:00:00', '12:00:00', '13:00:00', 1),
    (1, 'WEDNESDAY', '09:00:00', '17:00:00', '12:00:00', '13:00:00', 1),
    (1, 'THURSDAY',  '09:00:00', '17:00:00', '12:00:00', '13:00:00', 1),
    (1, 'FRIDAY',    '09:00:00', '16:00:00', '12:00:00', '13:00:00', 1),
    (1, 'SATURDAY',  '09:00:00', '12:00:00', NULL,        NULL,        0),
    (1, 'SUNDAY',    '09:00:00', '17:00:00', NULL,        NULL,        0);

-- Working hours for Provider 2 (Mon-Sat 9-18, lunch 13-14)
INSERT IGNORE INTO working_hours (provider_id, day_of_week, start_time, end_time, lunch_start, lunch_end, is_working)
VALUES
    (2, 'MONDAY',    '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
    (2, 'TUESDAY',   '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
    (2, 'WEDNESDAY', '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
    (2, 'THURSDAY',  '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
    (2, 'FRIDAY',    '09:00:00', '18:00:00', '13:00:00', '14:00:00', 1),
    (2, 'SATURDAY',  '09:00:00', '13:00:00', NULL,        NULL,        1),
    (2, 'SUNDAY',    '09:00:00', '17:00:00', NULL,        NULL,        0);

-- App Settings
INSERT IGNORE INTO app_settings (id, business_name, business_email, timezone,
    default_appointment_duration, slot_interval_minutes,
    office_start_time, office_end_time,
    max_advance_booking_days, min_cancellation_hours, reminder_hours_before)
VALUES (1, 'Appointment Agent', 'contact@appointmentagent.com', 'UTC',
        30, 30, '09:00:00', '17:00:00', 60, 24, 24);
