# PawConnect

Animal Shelter & Adoption Management System

PawConnect is a web application for a small animal shelter that takes in dogs and cats. Visitors can browse the animals without an account. Registered adopters can apply to adopt, request a visit and follow the status of their requests. One admin account runs the shelter side: animal records, medical records, applications, appointments and completed adoptions.

This is a team project for CSE 5324-001 (Agile Object-Oriented Software Engineering), Fall 2026.

## Project Status

The frontend screens are in place and currently run on sample data. The API and the database are being built sprint by sprint, so the app is not connected to a backend yet.

## Features

**Visitors**

- Browse dog and cat listings without an account
- Search by name or breed, and filter by type, gender and status
- Open a detailed animal profile with photo, breed, age, gender, description, status and health information

**Adopters**

- Register, log in and log out
- View and update profile and contact information
- Submit an adoption application (not allowed for animals that are already adopted)
- Request a visit by picking a date and time (the same animal, date and time cannot be booked twice)
- Track the status of their own applications and appointments
- See their adoption history

**Admin**

- Dashboard with a summary of shelter activity
- Add and update animal records and change an animal's status
- Create, view and update medical records for each animal
- Review adoption applications and approve or reject them
- View and update appointment requests
- Complete an approved adoption and review the adoption history

**General**

- Role-based access: adopter pages and admin pages are separate, and adopters only see their own applications and appointments
- Passwords are stored as hashes, never as plain text

### Animal status

An animal is always in one of these statuses: Available, Application Pending, Approved, Fostered or Adopted. A new application moves an Available animal to Application Pending, approving it moves the animal to Approved, and completing the adoption moves it to Adopted. If an application is rejected, the animal goes back to Available. Fostered is just a status, there is no separate foster management.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, TypeScript, Vite, Tailwind CSS 4 |
| Backend | Node.js, Express, TypeScript, zod for validation |
| Database | MySQL 8 with Knex migrations and seeds |
| Auth | JWT in an httpOnly cookie, passwords hashed with bcryptjs |
| Testing | Vitest and Supertest |
| Tools | Git, GitHub and GitHub Projects |

## Getting Started

### Prerequisites

- Node.js 20.19 or newer (22.12 or newer also works)
- npm, which comes with Node.js
- MySQL 8, needed once the API is in place

### Run the frontend

```bash
git clone -b development https://github.com/hbprasad0110-rgb/PawConnect.git
cd PawConnect/frontend
npm install
npm run dev
```

Open http://localhost:5173 in your browser.

Other scripts, all run from `frontend/`:

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server |
| `npm run build` | Builds the app into `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run typecheck` | Runs the TypeScript compiler without writing files |

The prototype comes with two sample accounts (see `frontend/src/data.ts`):

| Role | Email | Password |
| --- | --- | --- |
| Adopter | sarah@example.com | password123 |
| Admin | admin@pawconnect.edu | admin123 |

### Run the API and database

Not available yet. The Express API (`backend/`) and the MySQL schema are still in development. The steps for the environment file, migrations and seed data will be added here once they are merged.

## Repository Layout

| Folder | Contents |
| --- | --- |
| `frontend/` | React and TypeScript app |
| `backend/` | Express API (in progress) |
| `docs/` | Project proposal and architecture notes |

## Contributing

Feature work happens on separate branches (for example `feature/auth`) that are merged into `development` through pull requests. At least one teammate reviews each change before it is merged.

## Team

Harsha Prasad, Himanshu Shimpi and Dipanjana Das.
