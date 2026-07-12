# HelpDesk Lite

A lightweight, full-stack help desk web application built for simplicity, speed, and usability.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, React Router, Axios, Tailwind CSS, Lucide React, React Hot Toast |
| Backend | Node.js, Express, JWT, bcrypt |
| Database | MySQL |

## Features

- **Role-based portals**: Client, Support Agent, Manager
- **JWT authentication** with secure API routes
- **Ticket management**: Create, assign, update status, messaging
- **Search, filter, sort, pagination** on ticket lists
- **FAQ sidebar** for common issues (Client portal)
- **Team workload dashboard** (Manager portal)
- **Dark mode ready** structure (Tailwind `darkMode: 'class'`)

## Project Structure

```
HelpDesk/
├── backend/          # Express REST API
├── frontend/         # React + Vite SPA
└── database/         # MySQL schema
```

## Prerequisites

- Node.js 18+
- MySQL 8+

## Setup

### 1. Database

```bash
mysql -u root -p < database/schema.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your MySQL credentials
npm install
node utils/seed.js
npm run dev
```

API runs at `http://localhost:5000`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs at `http://localhost:3000`

## Default Accounts

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Support Agent | sara.agent@helpdesk.com | Password123! |
| Support Agent | ahmed.agent@helpdesk.com | Password123! |
| Manager | mina.manager@helpdesk.com | Password123! |

Clients register via the `/register` page.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register (Client only) |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get current user |
| GET/POST | `/api/tickets` | List / Create tickets |
| GET | `/api/tickets/:id` | Ticket details |
| POST | `/api/tickets/:id/assign` | Assign ticket |
| PATCH | `/api/tickets/:id/status` | Update status |
| POST | `/api/tickets/:id/messages` | Add message |
| GET | `/api/users` | List users (Manager) |
| GET | `/api/users/agents` | List agents |

## Design

- Primary: `#2563EB`
- Background: `#F8FAFC`
- Minimal UI inspired by Linear, Notion, GitHub

## License

MIT
