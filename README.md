# BookFlow — Booking & Scheduling System

Full-stack SaaS-style booking platform for service businesses (gyms, consultants, salons, etc.). Customers browse services, book a time slot, and pay online. Admins manage services, view bookings, and track revenue.

**Live demo:** https://book-flow-nu.vercel.app
**Backend API:** https://book-flow-production.up.railway.app

## Try it
- Browse services and book a time slot as a guest
- Sign up, complete a real booking, and pay with Stripe's test card: `4242 4242 4242 4242` (any future expiry, any CVC)
- Admin login: `admin@bookflow.com` / `Admin123!` — view the dashboard, manage bookings and services

## Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router
- **Backend:** Node.js, Express, JWT auth
- **Database:** MySQL (Aiven)
- **Payments:** Stripe (test mode, with webhook-verified payment confirmation)
- **Deployment:** Vercel (frontend) + Railway (backend)

## Features
- Customer auth (signup/login) with JWT
- Live availability calendar with double-booking protection (server-side slot validation)
- Stripe payment flow with webhook-based payment confirmation (not just client-side trust)
- Admin dashboard: revenue stats, booking status management, service CRUD

## Project structure
