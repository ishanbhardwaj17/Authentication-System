# 🔐 Auth System (Node.js • JWT • Redis • Email OTP)

![Node.js](https://img.shields.io/badge/Node.js-Backend-green)
![Express](https://img.shields.io/badge/Express.js-Framework-black)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-green)
![Redis](https://img.shields.io/badge/Redis-Cache-red)
![JWT](https://img.shields.io/badge/JWT-Authentication-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

A **production-style authentication system** built using **Node.js, Express, MongoDB, Redis, and JWT**.

This project demonstrates a **secure backend authentication architecture** including **email OTP verification, refresh tokens, Redis session caching, and token blacklisting** similar to real-world SaaS applications.

---

# 🚀 Features

✅ User Registration
✅ Email OTP Verification
✅ Resend OTP
✅ Secure Login
✅ JWT Access Tokens
✅ Refresh Token Rotation
✅ Redis Session Caching
✅ Access Token Blacklisting (Logout)
✅ HTTP-only Refresh Token Cookies
✅ Session Tracking (IP + User-Agent)

---

# 🏗️ Architecture

```text
Client
   │
   ▼
Express API (Node.js)
   │
   ├── MongoDB
   │     ├── Users
   │     ├── OTPs
   │     └── Sessions
   │
   └── Redis
         ├── Session Cache
         └── Token Blacklist
```

Authentication Flow:

```text
Register
   ↓
OTP sent to Email
   ↓
Verify Email
   ↓
Login
   ↓
Access Token (10 minutes)
Refresh Token (7 days)
   ↓
Session stored in MongoDB
Session cached in Redis
```

---

# 🧰 Tech Stack

Backend

* Node.js
* Express.js

Database

* MongoDB
* Redis

Authentication

* JSON Web Tokens (JWT)
* bcrypt

Email Service

* Nodemailer

Testing

* Postman

---

# 📁 Project Structure

```text
Auth-System
│
├── src
│   │
│   ├── controllers
│   │      auth.controller.js
│   │
│   ├── models
│   │      user.model.js
│   │      session.model.js
│   │      otp.model.js
│   │
│   ├── routes
│   │      auth.routes.js
│   │
│   ├── config
│   │      config.js
│   │      cache.js
│   │
│   ├── services
│   │      email.service.js
│   │
│   ├── utils
│   │      utils.js
│   │
│   └── server.js
│
├── package.json
└── README.md
```

---

# ⚙️ Environment Variables

Create a `.env` file in the root directory.

```env
PORT=3000

MONGO_URI=your_mongodb_connection_string

JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d

REDIS_URL=redis://127.0.0.1:6379

EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

---

# 📦 Installation

Clone the repository

```bash
git clone https://github.com/your-username/auth-system.git
```

Navigate to the project directory

```bash
cd auth-system
```

Install dependencies

```bash
npm install
```

Start the development server

```bash
npm run dev
```

Server runs on

```text
http://localhost:3000
```

---

# 🧪 API Endpoints

## Register User

```http
POST /api/auth/register
```

Body

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

---

## Verify Email OTP

```http
POST /api/auth/verify-email
```

Body

```json
{
  "email": "john@example.com",
  "otp": "123456"
}
```

---

## Resend OTP

```http
POST /api/auth/resend-otp
```

Body

```json
{
  "email": "john@example.com"
}
```

---

## Login

```http
POST /api/auth/login
```

Body

```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

Response

```json
{
  "accessToken": "JWT_TOKEN"
}
```

Refresh token is stored in **HTTP-only cookie**.

---

## Get Current User

```http
GET /api/auth/me
```

Headers

```http
Authorization: Bearer ACCESS_TOKEN
```

---

## Refresh Access Token

```http
POST /api/auth/refresh-token
```

Uses refresh token stored in cookie.

---

## Logout

```http
POST /api/auth/logout
```

Headers

```http
Authorization: Bearer ACCESS_TOKEN
```

Actions performed:

* Blacklists access token in Redis
* Deletes session from MongoDB
* Clears refresh token cookie

---

# 🔐 Security Features

✔ Password hashing with bcrypt
✔ HTTP-only refresh token cookies
✔ Access token expiration
✔ Refresh token rotation
✔ Redis token blacklist
✔ Email OTP verification
✔ Session tracking (IP + User-Agent)

---

# 🗄️ Database Collections

Users

```text
users
```

Stores user credentials and verification status.

OTP

```text
otps
```

Stores hashed OTPs used for email verification.

Sessions

```text
sessions
```

Stores refresh token hashes and session metadata.

---

# 🧪 Testing

You can test the API using **Postman**.

Recommended flow:

```text
1 Register
2 Verify Email
3 Login
4 Access Protected Route
5 Refresh Token
6 Logout
```

---

# 📌 Future Improvements

* Forgot Password / Reset Password
* Google OAuth Login
* OTP Rate Limiting
* Device-based session management
* Swagger API Documentation

---

# 👨‍💻 Author

Built as a **backend authentication system project** demonstrating modern authentication architecture using Node.js.

---

# ⭐ Support

If you like this project, consider **starring the repository**.
