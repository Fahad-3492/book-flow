# BookFlow — Booking & Scheduling System

Full-stack SaaS-style booking platform for service businesses (gyms, consultants, salons, etc.). Customers browse services, book a time slot, and pay online. Admins manage services, view bookings, and track revenue.

## Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, JWT auth
- **Database:** MySQL
- **Payments:** Stripe (test mode)

## Project structure
```
bookflow/
├── backend/     Express API, MySQL queries, auth, Stripe integration
└── frontend/    React app — customer + admin interfaces
```

## Status
🚧 In development.

## Setup
See `backend/.env.example` and `frontend/.env.example` for required environment variables.

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```
