# Quick Setup Guide

## Prerequisites

| Tool    | Version   | Download |
|---------|-----------|----------|
| Java    | 21+       | https://adoptium.net |
| Maven   | 3.9+      | https://maven.apache.org |
| Node.js | 20+       | https://nodejs.org |
| MySQL   | 8.0+      | https://dev.mysql.com |

---

## Step 1 — MySQL Database

```sql
-- Run in MySQL client
CREATE DATABASE appointment_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

---

## Step 2 — Backend Configuration

Edit `backend/src/main/resources/application.properties`:

```properties
spring.datasource.username=root       # your MySQL username
spring.datasource.password=root       # your MySQL password
```

Flyway will automatically create all tables and insert seed data on first run.

---

## Step 3 — Start the Backend

```bash
cd backend
mvn spring-boot:run
```

The API starts at: **http://localhost:8080/api**
Swagger UI:        **http://localhost:8080/api/swagger-ui.html**

---

## Step 4 — Start the Frontend

```bash
cd frontend
npm install
npm run dev
```

The app opens at: **http://localhost:5173**

---

## Step 5 — Log In

| Role     | Email                              | Password       |
|----------|------------------------------------|----------------|
| Admin    | admin@appointmentagent.com         | `Admin@1234`   |
| Customer | jane.smith@example.com             | `Customer@1234`|

---

## Docker (Optional — runs everything together)

```bash
cp .env.example .env
# Edit .env with your settings if needed

docker-compose up --build -d

# Check logs
docker-compose logs -f backend
```

- App:      http://localhost
- API:      http://localhost:8080/api
- Swagger:  http://localhost:8080/api/swagger-ui.html

---

## Troubleshooting

### Backend won't start
- Check MySQL is running on port 3306
- Verify credentials in `application.properties`
- Check Java 21 is installed: `java -version`

### Frontend errors
- Run `npm install` again
- Check Node.js 20+: `node -v`
- Vite proxy is configured for `/api → localhost:8080`

### Flyway errors
- If you see checksum mismatch errors, run: `TRUNCATE TABLE flyway_schema_history;`
- Or drop and recreate the database

### Email not working
- Leave `spring.mail.username` empty to disable email (emails are logged to console)
- Or configure a Gmail App Password in `application.properties`
