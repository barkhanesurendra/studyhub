# StudyHub Pro — Node.js + MySQL

## Requirements
- Node.js 18+
- MySQL 8+

## Setup
1. Create a MySQL database named `studyhub`.
2. Copy `.env.example` to `.env`.
3. Put your MySQL username/password in `.env`.
4. Set a strong `JWT_SECRET`.
5. Run `npm install`.
6. Run `npm start`.
7. Open `http://localhost:5000`.

The server automatically creates the tables.

## Admin
Register normally, then run:
`UPDATE users SET role='admin' WHERE email='your@email.com';`

## Included API
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET/POST `/api/courses`
- GET/POST `/api/notes`
- GET/POST `/api/classes`
- GET/POST `/api/tests`
- POST `/api/results`
- GET `/api/my-results`
- GET `/api/admin/students`

The frontend is intentionally simple and ready to be extended with real PDF storage (S3/Cloudinary/local uploads), YouTube embeds, richer admin CRUD and payment integration.
