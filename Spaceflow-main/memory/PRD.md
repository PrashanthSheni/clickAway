# Smart Resource Booking System — PRD

## Problem Statement (original)
Internal enterprise web application to let employees book resources (rooms, desks, parking, equipment) with approvals, policies, smart suggestions and analytics. Full spec in initial user message. Three roles: employee / manager / admin. Stack: FastAPI + PostgreSQL + React 18 + Tailwind + shadcn/ui + react-router v6 + Recharts + react-big-calendar + APScheduler + JWT.

## Architecture
- **Backend**: FastAPI with async SQLAlchemy, PostgreSQL 15 (supervisor-managed), APScheduler for background jobs. Routers split by domain (auth, resources, bookings, notifications, maintenance, reports, calendar, users).
- **Frontend**: React 18 + React Router v7, shadcn-friendly Tailwind, Recharts, react-big-calendar.
- **Auth**: JWT (HS256, 7 day expiry) via bcrypt password hashing. Token stored in localStorage; `Authorization: Bearer`.
- **DB**: PostgreSQL at localhost:5432, DB=`booking_db`, user=`booking_user`.

## Personas
- Employee — books resources, cancels, checks-in, requests extensions.
- Manager — approves/rejects bookings/extensions, views team.
- Admin — full CRUD on resources, maintenance, policies, analytics, force-cancel.

## Core Requirements (static)
- 19 screens, role-based navigation
- State machine with strict transitions
- Smart validation (/bookings/validate) with errors/warnings/suggestions
- Smart suggestions engine (same-next-slot, same-time-next-day, alt resource)
- Behavioural Reliability Score (BRS) affecting auto-approval gating
- QR + 6-digit check-in with 10-min-before / 15-min-after window
- Maintenance blocks with impact preview + auto-cancel
- Approval flow with escalation after 24h
- Real-time (polled 30s) notifications
- Analytics: utilization, no-show rate, peak heatmap, department usage, underutilized detection

## Implemented (2026-02)
### Backend
- PostgreSQL installed + supervisor config, async SQLAlchemy models for 9 tables
- JWT auth with bcrypt, seed for admin/manager/3 employees + 6 demo resources + policies
- REST API: /auth (login/me), /resources (CRUD, policy), /bookings (create, validate, approve, reject, cancel, checkin, extend, list, events, QR), /notifications (list, unread, read, read-all), /maintenance (preview, create), /reports/overview, /calendar/{employee,team,resource/{id}}, /users
- State machine with enforced transitions in services.py
- Smart suggestions (3 strategies + rank score)
- QR code generation (PNG base64) + 6-digit code
- APScheduler: no-show warning (1min), auto-no-show (1min), complete-bookings (1min), approval escalation (10min)
- Behavioural Reliability Score (auto-recomputed on no-show/cancel/complete)

### Frontend (all 19 screens)
Login, Employee Dashboard, Browse Resources, Booking Form (live validation + suggestions), My Bookings, Booking Detail (timeline + QR + check-in + extend + cancel), Calendar (employee/team/resource), Floor Map (pin-based), QR Check-in, Manager Dashboard, Approval Queue, Team Calendar, Admin Dashboard, Resource Management (CRUD + maintenance dialog w/ impact preview), Policy Configuration (+ simulation), Reports & Analytics, All Bookings (force-cancel), Profile, Notifications Panel. Sidebar + top navbar. Inter font, Blue #2563EB primary.

## Test Credentials
See `/app/memory/test_credentials.md`

## Prioritized Backlog (next)
- P1: Add CSV export of bookings & analytics.
- P1: Email notifications (SendGrid / Resend integration).
- P2: Advanced escalation rules per department.
- P2: Recurring bookings.
- P2: Team favourites / "book again" quick action.
