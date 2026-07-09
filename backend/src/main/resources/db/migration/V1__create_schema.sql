-- ============================================================
-- V1: Create full schema
-- ============================================================

CREATE TABLE IF NOT EXISTS roles (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(20) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS users (
    id                          BIGINT AUTO_INCREMENT PRIMARY KEY,
    first_name                  VARCHAR(100) NOT NULL,
    last_name                   VARCHAR(100) NOT NULL,
    email                       VARCHAR(255) NOT NULL UNIQUE,
    password                    VARCHAR(255) NOT NULL,
    phone                       VARCHAR(20),
    address                     VARCHAR(500),
    profile_image_url           VARCHAR(500),
    enabled                     TINYINT(1) NOT NULL DEFAULT 1,
    email_verified              TINYINT(1) NOT NULL DEFAULT 0,
    email_verification_token    VARCHAR(255),
    password_reset_token        VARCHAR(255),
    password_reset_token_expiry DATETIME,
    deleted                     TINYINT(1) NOT NULL DEFAULT 0,
    created_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at                  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_email (email),
    INDEX idx_user_phone (phone)
);

CREATE TABLE IF NOT EXISTS user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (role_id) REFERENCES roles (id)
);

CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT NOT NULL UNIQUE,
    token       VARCHAR(512) NOT NULL UNIQUE,
    expiry_date DATETIME NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS services (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    name             VARCHAR(150) NOT NULL,
    description      VARCHAR(500),
    duration_minutes INT          NOT NULL,
    price            DECIMAL(10, 2),
    color            VARCHAR(255),
    active           TINYINT(1)   NOT NULL DEFAULT 1,
    mode             VARCHAR(20)  NOT NULL DEFAULT 'OFFLINE',
    created_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at       DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS providers (
    id                      BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT NOT NULL UNIQUE,
    specialization          VARCHAR(150),
    bio                     VARCHAR(500),
    location                VARCHAR(255),
    buffer_minutes          INT    NOT NULL DEFAULT 0,
    max_appointments_per_day INT   NOT NULL DEFAULT 20,
    active                  TINYINT(1) NOT NULL DEFAULT 1,
    created_at              DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME   NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

CREATE TABLE IF NOT EXISTS provider_services (
    provider_id BIGINT NOT NULL,
    service_id  BIGINT NOT NULL,
    PRIMARY KEY (provider_id, service_id),
    FOREIGN KEY (provider_id) REFERENCES providers (id),
    FOREIGN KEY (service_id)  REFERENCES services (id)
);

CREATE TABLE IF NOT EXISTS working_hours (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    provider_id  BIGINT      NOT NULL,
    day_of_week  VARCHAR(10) NOT NULL,
    start_time   TIME        NOT NULL,
    end_time     TIME        NOT NULL,
    lunch_start  TIME,
    lunch_end    TIME,
    is_working   TINYINT(1)  NOT NULL DEFAULT 1,
    UNIQUE KEY uq_provider_day (provider_id, day_of_week),
    FOREIGN KEY (provider_id) REFERENCES providers (id)
);

CREATE TABLE IF NOT EXISTS holidays (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(150) NOT NULL,
    date        DATE         NOT NULL,
    description VARCHAR(500),
    provider_id BIGINT,
    recurring   TINYINT(1)   NOT NULL DEFAULT 0,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (provider_id) REFERENCES providers (id)
);

CREATE TABLE IF NOT EXISTS appointments (
    id                   BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_number   VARCHAR(20)  NOT NULL UNIQUE,
    customer_id          BIGINT       NOT NULL,
    provider_id          BIGINT       NOT NULL,
    service_id           BIGINT       NOT NULL,
    appointment_date     DATE         NOT NULL,
    start_time           TIME         NOT NULL,
    end_time             TIME         NOT NULL,
    status               VARCHAR(20)  NOT NULL DEFAULT 'PENDING',
    type                 VARCHAR(20)  NOT NULL DEFAULT 'REGULAR',
    notes                VARCHAR(1000),
    reason               VARCHAR(500),
    meeting_link         VARCHAR(500),
    meeting_platform     VARCHAR(20),
    reminder_sent        TINYINT(1)   NOT NULL DEFAULT 0,
    confirmation_sent    TINYINT(1)   NOT NULL DEFAULT 0,
    rescheduled_from_id  BIGINT,
    cancelled_at         DATETIME,
    cancellation_reason  VARCHAR(500),
    created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_appointment_customer (customer_id),
    INDEX idx_appointment_provider (provider_id),
    INDEX idx_appointment_date    (appointment_date),
    INDEX idx_appointment_status  (status),
    FOREIGN KEY (customer_id)         REFERENCES users (id),
    FOREIGN KEY (provider_id)         REFERENCES providers (id),
    FOREIGN KEY (service_id)          REFERENCES services (id),
    FOREIGN KEY (rescheduled_from_id) REFERENCES appointments (id)
);

CREATE TABLE IF NOT EXISTS notifications (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id        BIGINT       NOT NULL,
    appointment_id BIGINT,
    title          VARCHAR(255) NOT NULL,
    message        VARCHAR(1000) NOT NULL,
    type           VARCHAR(50)  NOT NULL,
    is_read        TINYINT(1)   NOT NULL DEFAULT 0,
    read_at        DATETIME,
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_notification_user (user_id),
    INDEX idx_notification_read (is_read),
    FOREIGN KEY (user_id)        REFERENCES users (id),
    FOREIGN KEY (appointment_id) REFERENCES appointments (id)
);

CREATE TABLE IF NOT EXISTS app_settings (
    id                               BIGINT AUTO_INCREMENT PRIMARY KEY,
    business_name                    VARCHAR(200) NOT NULL,
    business_logo_url                VARCHAR(500),
    business_address                 VARCHAR(500),
    business_phone                   VARCHAR(20),
    business_email                   VARCHAR(255),
    timezone                         VARCHAR(50)  NOT NULL DEFAULT 'UTC',
    default_appointment_duration     INT          NOT NULL DEFAULT 30,
    slot_interval_minutes            INT          NOT NULL DEFAULT 30,
    office_start_time                TIME         NOT NULL DEFAULT '09:00:00',
    office_end_time                  TIME         NOT NULL DEFAULT '17:00:00',
    max_advance_booking_days         INT          NOT NULL DEFAULT 60,
    min_cancellation_hours           INT          NOT NULL DEFAULT 24,
    reminder_hours_before            INT          NOT NULL DEFAULT 24,
    email_notifications_enabled      TINYINT(1)   NOT NULL DEFAULT 1,
    sms_notifications_enabled        TINYINT(1)   NOT NULL DEFAULT 0,
    browser_notifications_enabled    TINYINT(1)   NOT NULL DEFAULT 1,
    updated_at                       DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id     BIGINT,
    action      VARCHAR(100)  NOT NULL,
    entity_type VARCHAR(100)  NOT NULL,
    entity_id   BIGINT,
    details     VARCHAR(2000),
    ip_address  VARCHAR(45),
    user_agent  VARCHAR(500),
    level       VARCHAR(10)   NOT NULL DEFAULT 'INFO',
    created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_user    (user_id),
    INDEX idx_audit_action  (action),
    INDEX idx_audit_created (created_at),
    FOREIGN KEY (user_id) REFERENCES users (id)
);
