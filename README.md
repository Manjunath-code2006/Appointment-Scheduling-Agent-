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
