# Fastor CRM – Lead Management System

A CRM backend (Node.js + Express + MongoDB + JWT) where prospective clients submit enquiries through a public form, and counselors/employees can view those public leads and **claim** them. Once claimed, a lead becomes private to that counselor.

The repo also includes a small React (Vite + Tailwind) mobile-style frontend that consumes the API.

---

## Features

- **Employee/Counselor authentication** – register and login with email + password, secured with JWT.
- **OTP login (Fastor)** – optional phone + OTP login via the Fastor staging API, which auto-provisions a counselor account in the CRM.
- **Public enquiry form API** – no authentication needed; anyone can submit a lead.
- **Unclaimed (public) leads** – all logged-in counselors can see them.
- **Claim a lead** – assigns it exclusively to the logged-in counselor and removes it from the public list.
- **My claimed leads** – a counselor sees only the leads they claimed.
- **Lead details & updates** – view a lead, change status, add notes (only the owner, or an admin).
- Zero-config database: falls back to an in-memory MongoDB if no `MONGO_URI` is set.

## Tech Stack

| Layer    |                                      Technology                                          |
|----------|------------------------------------------------------------------------------------------|
| Backend  | Node.js, Express 5, Mongoose, JWT (`jsonwebtoken`), `bcryptjs`, `cors`, `morgan`, `axios`|
| Database | MongoDB (`mongodb-memory-server` used as fallback)                                       |
| Frontend | React 19, Vite, Tailwind CSS, `lucide-react`, `axios`                                    |

## Project Structure

```
crm-app/
├── backend/
│   ├── config/db.js                  # MongoDB connection (+ in-memory fallback)
│   ├── controllers/
│   │   ├── authController.js         # register, login, Fastor OTP login, getMe
│   │   ├── enquiryController.js      # create/list/claim/update enquiries
│   │   └── fastorController.js       # proxy to Fastor restaurant API
│   ├── middleware/authMiddleware.js  # JWT `protect` middleware
│   ├── models/
│   │   ├── Employee.js               # counselor schema (bcrypt-hashed password)
│   │   └── Enquiry.js                # lead schema (claimedBy, status, notes...)
│   ├── routes/                       # authRoutes, enquiryRoutes, fastorRoutes
│   ├── server.js                     # Express app entry point
│   └── .env                          # environment variables
├── frontend/                         # React + Vite UI
└── figmadesigntheme/                 # Design screenshots used for the UI
```

## How It Works

1. A prospective client fills the enquiry form → `POST /api/enquiries/public` (no auth). The lead is stored with `status: "unclaimed"` and `claimedBy: null`.
2. A counselor logs in and calls `GET /api/enquiries/public` to see all unclaimed leads.
3. The counselor calls `POST /api/enquiries/:id/claim`. The lead's `claimedBy`, `claimedByEmail`, `claimedAt` are set and `status` becomes `claimed`.
4. The lead disappears from the public list for everyone else, and appears in the counselor's `GET /api/enquiries/my-claims`.
5. Other counselors cannot open or update a lead claimed by someone else (403), except admins.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- (Optional) A MongoDB instance (local or Atlas). Without one, the app uses an in-memory MongoDB – **data is lost on restart**.

### 1. Clone

```bash
git clone <your-repo-url>
cd crm-app
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create / edit `backend/.env`:

```env
PORT=5000
NODE_ENV=development
JWT_SECRET=replace_with_a_long_random_secret
MONGO_URI=mongodb://127.0.0.1:27017/fastor_crm   # optional – omit to use in-memory DB
FASTOR_BASE_URL=https://staging.fastor.ai/v1
```

Start the server:

```bash
npm start
```

Health check: <http://localhost:5000/api/health>

### 3. Frontend setup (optional)

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000 (proxies /api to :5000)
```

To serve the UI from the backend, run `npm run build` in `frontend/`; Express serves `frontend/dist` automatically.

---

## API Reference

Base URL: `http://localhost:5000/api`

Protected routes need the header: `Authorization: Bearer <token>`

### Auth

| Method | Endpoint               | Auth |              Description                          |
|--------|------------------------|------|---------------------------------------------------|
| POST   | `/auth/register`       | No   | Register an employee/counselor                    |
| POST   | `/auth/login`          | No   | Login, returns JWT                                |
| GET    | `/auth/me`             | Yes  | Current logged-in employee profile                |
| POST   | `/auth/fastor-register`| No   | Request OTP from Fastor for a phone number        |
| POST   | `/auth/fastor-login`   | No   | Verify OTP, create/find counselor, return CRM JWT |

**Register** – `POST /auth/register`
```json
{
  "name": "Sarita Sharma",
  "email": "sarita@company.com",
  "password": "secret123"
}
```

**Login** – `POST /auth/login`
```json
{
  "email": "sarita@company.com",
  "password": "secret123"
}
```
Response:
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": {
    "_id": "...",
    "name": "Sarita Sharma",
    "email": "sarita@company.com",
    "role": "counselor",
    "token": "<JWT>"
  }
}
```

### Enquiries (Leads)

| Method |        Endpoint        | Auth   |                       Description                            |
|--------|------------------------|--------|--------------------------------------------------------------|
| POST   | `/enquiries/public`    | **No** | Submit the public enquiry form                               |
| GET    | `/enquiries/public`    | Yes    | Fetch all unclaimed (public) leads                           |
| POST   | `/enquiries/:id/claim` | Yes    | Claim a lead (makes it private)                              |
| GET    | `/enquiries/my-claims` | Yes    | Fetch leads claimed by the logged-in user                    |
| GET    | `/enquiries/:id`       | Yes    | Get one lead (blocked if claimed by someone else)            |
| PATCH  | `/enquiries/:id`       | Yes    | Update status / tier / value, or add a note (owner or admin) |

**Submit enquiry** – `POST /enquiries/public`
```json
{
  "name": "Rahul Verma",
  "email": "rahul@example.com",
  "phone": "9876543210",
  "courseInterest": "Full Stack Development",
  "message": "Please call me in the evening"
}
```
Required: `name`, `email`, `phone`, `courseInterest`.

**Claim** – `POST /enquiries/:id/claim` (no body)

| Case                                  |             Response                           |
|---------------------------------------|------------------------------------------------|
| Success                               | `200` – lead returned with `status: "claimed"` |
| Already claimed by you / someone else | `400`                                          |
| Invalid / missing lead                | `404`                                          |
| No or invalid token                   | `401`                                          |

**Update** – `PATCH /enquiries/:id`
```json
{ "status": "contacted", "note": "Called, will enroll next week" }
```
Allowed status values: `unclaimed`, `claimed`, `contacted`, `in_review`, `enrolled`, `closed`.

### Other

| Method | Endpoint | Description |
|--------|----------------------------------|-----------------------------------------|
| GET    | `/health`                        | Service health check                    |
| GET    | `/fastor/restaurants?city_id=118`| Proxy to Fastor staging restaurant list |

---

## Data Models

**Employee** – `name`, `email` (unique), `password` (bcrypt hash, hidden by default), `phone`, `dialCode`, `role` (`counselor` | `senior_counselor` | `admin`), `fastorToken`, `avatar`.

**Enquiry** – `name`, `email`, `phone`, `courseInterest`, `message`, `preferredTier`, `estimatedValue`, `status`, `claimedBy` (ref Employee), `claimedByEmail`, `claimedAt`, `notes[]`, `source`, plus timestamps.

## Quick Test with cURL

```bash
# 1. Register
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@company.com","password":"secret123"}'

# 2. Submit a public enquiry (no token)
curl -X POST http://localhost:5000/api/enquiries/public \
  -H "Content-Type: application/json" \
  -d '{"name":"Rahul","email":"rahul@example.com","phone":"9876543210","courseInterest":"React"}'

# 3. List unclaimed leads
curl http://localhost:5000/api/enquiries/public -H "Authorization: Bearer <TOKEN>"

# 4. Claim a lead
curl -X POST http://localhost:5000/api/enquiries/<LEAD_ID>/claim -H "Authorization: Bearer <TOKEN>"

# 5. My claimed leads
curl http://localhost:5000/api/enquiries/my-claims -H "Authorization: Bearer <TOKEN>"
```

## Assignment Requirements Checklist

| Requirement                                  | Status |
|----------------------------------------------|--------|
| Node.js + Express                            | ✅    |
| Database (MongoDB)                           | ✅    |
| JWT authentication                           | ✅    |
| Employee login/register API                  | ✅    |
| Public form API without auth                 | ✅    |
| API to claim leads                           | ✅    |
| API to fetch unclaimed leads                 | ✅    |
| API to fetch leads claimed by logged-in user | ✅    |
