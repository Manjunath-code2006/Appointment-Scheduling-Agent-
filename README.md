<<<<<<< HEAD
# Appointment Agent — AI-Powered Scheduling System

A full-stack appointment scheduling application with an integrated AI chatbot assistant, built with **Spring Boot 3** (backend) and **React 18 + TypeScript + Vite** (frontend).

---

## Features

- **AI Chatbot** — natural language booking, rescheduling, and cancellation
- **JWT Authentication** — secure login, registration, refresh tokens, email verification
- **Role-based access control** — Admin and Customer roles
- **Appointment management** — book, reschedule, cancel, view history
- **Availability engine** — real-time slot calculation respecting working hours, holidays, lunch breaks, buffer time
- **Calendar view** — monthly calendar with color-coded appointments
- **Admin dashboard** — charts, stats, full appointment management
- **Notifications** — in-app notification feed with unread badges
- **Settings management** — working hours, holidays, slot intervals, email config
- **Reports & CSV export** — date-range appointment reports
- **Dark / Light mode** — persistent theme toggle
- **Fully responsive** — mobile-first design

---

## Tech Stack

| Layer     | Technology |
|-----------|-----------|
| Frontend  | React 18, TypeScript, Vite, Tailwind CSS, ShadCN UI, Recharts, React Hook Form + Zod |
| Backend   | Spring Boot 3.2, Java 21, Spring Security, Spring Data JPA |
| Database  | MySQL 8.0 (Flyway migrations) |
| Auth      | JWT (access + refresh tokens) |
| Docs      | Swagger / OpenAPI 3 (`/api/swagger-ui.html`) |
| Container | Docker + Docker Compose |

---

## Quick Start

### Prerequisites

| Tool | Version |
|------|---------|
| Java | 21+ |
| Maven | 3.9+ |
| Node.js | 20+ |
| MySQL | 8.0+ |

---

### 1. Database

Create the database (Flyway creates all tables automatically):

```sql
CREATE DATABASE appointment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

---

### 2. Backend

```bash
cd backend

# Edit src/main/resources/application.properties:
# spring.datasource.username=root
# spring.datasource.password=<your-password>
# spring.mail.*  (optional — emails are logged if SMTP not configured)

mvn spring-boot:run
```

API runs at: **http://localhost:8080/api**  
Swagger UI: **http://localhost:8080/api/swagger-ui.html**

---

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at: **http://localhost:5173**

---

### 4. Docker Compose (all-in-one)

```bash
# Copy and edit environment file
cp .env.example .env

# Start everything (DB + Backend + Frontend)
docker-compose up --build -d

# View logs
docker-compose logs -f backend
```

- Frontend: http://localhost
- Backend API: http://localhost:8080/api
- Swagger UI: http://localhost:8080/api/swagger-ui.html

---

## Default Accounts

| Role     | Email                              | Password      |
|----------|------------------------------------|---------------|
| Admin    | admin@appointmentagent.com         | Admin@1234    |
| Customer | jane.smith@example.com             | Customer@1234 |
| Customer | bob.johnson@example.com            | Customer@1234 |

---

## Project Structure

```
appointment-agent/
├── backend/                     # Spring Boot application
│   ├── src/main/java/com/appointmentagent/
│   │   ├── chatbot/             # AI intent detection + session management
│   │   ├── config/              # Security, CORS, OpenAPI, async executor
│   │   ├── controller/          # REST API controllers
│   │   ├── dto/                 # Request / response DTOs
│   │   ├── entity/              # JPA entities
│   │   ├── exception/           # Global exception handler
│   │   ├── repository/          # Spring Data JPA repositories
│   │   ├── security/            # JWT filter, UserDetails, auth entry point
│   │   ├── service/             # Business logic
│   │   └── utils/               # Appointment number generator
│   └── src/main/resources/
│       ├── application.properties
│       └── db/migration/        # Flyway SQL migrations
│
└── frontend/                    # React + TypeScript application
    └── src/
        ├── components/
        │   ├── common/          # AppointmentCard, StatCard, StatusBadge, ...
        │   ├── layout/          # Sidebar, Navbar, AppLayout, ProtectedRoute
        │   └── ui/              # ShadCN-style primitives (Button, Input, ...)
        ├── context/             # AuthContext (React Context + JWT)
        ├── hooks/               # useAppointments, useNotifications
        ├── pages/
        │   ├── admin/           # Dashboard, Users, Providers, Services, ...
        │   ├── auth/            # Login, Register, ForgotPassword, ResetPassword
        │   ├── customer/        # Customer Dashboard
        │   └── shared/          # Appointments, Calendar, Chat, Profile, ...
        ├── services/            # Axios API clients (one per domain)
        ├── types/               # Full TypeScript type definitions
        └── utils/               # cn(), formatDate(), getStatusColor(), ...
```

---

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new customer |
| POST | /api/auth/login | Login and receive JWT |
| POST | /api/auth/refresh-token | Refresh access token |
| POST | /api/auth/logout | Invalidate refresh token |
| POST | /api/auth/forgot-password | Request password reset |
| POST | /api/auth/reset-password | Reset password with token |
| GET  | /api/appointments | All appointments (Admin) |
| POST | /api/appointments | Book appointment |
| GET  | /api/appointments/my | Current user's appointments |
| GET  | /api/appointments/upcoming | Upcoming confirmed appointments |
| PUT  | /api/appointments/{id}/reschedule | Reschedule |
| PUT  | /api/appointments/{id}/cancel | Cancel |
| GET  | /api/availability/provider/{id} | Available time slots |
| GET  | /api/dashboard | Admin dashboard statistics |
| POST | /api/chat/message | AI chatbot message |
| GET  | /api/settings | Application settings |
| PUT  | /api/settings | Update settings (Admin) |
| GET  | /api/notifications | User notifications |
| GET  | /api/providers | List providers |
| GET  | /api/services | List services |
| GET  | /api/holidays | List holidays |

Full documentation: `/api/swagger-ui.html`

---

## Environment Variables (backend)

| Variable | Description | Default |
|----------|-------------|---------|
| `spring.datasource.url` | MySQL JDBC URL | localhost:3306/appointment_db |
| `spring.datasource.username` | DB username | root |
| `spring.datasource.password` | DB password | root |
| `app.jwt.secret` | JWT signing key (64-char hex) | (see application.properties) |
| `app.jwt.expiration-ms` | Access token TTL | 86400000 (24h) |
| `app.jwt.refresh-expiration-ms` | Refresh token TTL | 604800000 (7d) |
| `spring.mail.*` | SMTP configuration | (optional) |
| `app.frontend.url` | Frontend URL for email links | http://localhost:5173 |

---

## License

MIT
=======
# Appointment-Scheduling-Agent-
Appointment Agent is a full-stack web application for online appointment booking and management. It features secure JWT authentication, role-based access, provider and service management, appointment scheduling, availability checking, an admin dashboard, and REST APIs. Built with React, Spring Boot, Java, and H2 Database.
# Appointment Agent

A full-stack appointment booking and management system built with React, Spring Boot, and Java. Users can register, log in securely, book appointments, reschedule or cancel bookings, and manage appointments through an intuitive dashboard. Administrators can manage services, providers, appointments, and monitor the system from an admin dashboard.
Appointment Scheduling Agent
Technologies Used
Frontend
React.js
HTML
CSS
JavaScript

Purpose:

Build the user interface.
Allow users to register, log in, and book appointments.
Display appointment details.
Backend
Spring Boot
Java

Purpose:

Handle business logic.
Process appointment requests.
Manage authentication.
Connect to the database.
Database
H2 Database

Purpose:

Store users.
Store appointments.
Store providers.
Store services.
Security
JWT (JSON Web Token)

Purpose:

Secure login.
Authenticate users.
Protect APIs.
Main Features
User Registration
User Login
JWT Authentication
Book Appointment
Cancel Appointment
Reschedule Appointment
Provider Management
Service Management
Appointment Availability Checking
Admin Dashboard
REST API
How the Project Works
Step 1 – User Registration

The user creates an account using:

Name
Email
Password

The information is stored in the H2 database.

Step 2 – Login

The user logs in with their email and password.

Spring Boot verifies the credentials.

If they are correct, the system generates a JWT Token.

This token is used for future requests.

Step 3 – Dashboard

After logging in, the user is redirected to the dashboard.

The dashboard displays:

Available services
Providers
Appointment options
Step 4 – Book Appointment

The user selects:

Service
Provider
Date
Time

The frontend sends the request to the backend.

The backend checks if the slot is available.

If available:

Save the appointment.
Return a success message.
Step 5 – Appointment Management

Users can:

View appointments
Cancel appointments
Reschedule appointments

The backend updates the database accordingly.

Step 6 – Admin Dashboard

The admin can:

Add providers
Delete providers
Add services
Manage appointments
View all users
Project Flow
User
   ↓
React Frontend
   ↓
REST API
   ↓
Spring Boot Backend
   ↓
JWT Authentication
   ↓
H2 Database
   ↓
Response
   ↓
Frontend Displays Result
Folder Structure
Appointment-Agent
│
├── frontend
│   ├── src
│   ├── components
│   ├── pages
│   └── App.js
│
├── backend
│   ├── controller
│   ├── service
│   ├── repository
│   ├── entity
│   ├── security
│   └── AppointmentApplication.java
│
├── database
│   └── H2
│
└── README.md
>>>>>>> b5e907df3f964bcc43f3c418bf3eb6965ff5e929
