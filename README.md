
# PawConnect
Animal Shelter &amp; Adoption Management System

PawConnect is  the Animal Shelter and Adoption Management System.

This repository currently contains the initial project structure only. Functional development will be added through feature branches during the planned sprints.

## Technology

Frontend:
- React.js
- Bootstrap
- CSS

Backend:
- Node.js
- Express.js

Database:
- SQL database

Deployment:
- Vercel

Version Control:
- Git and GitHub

## Project Structure

```text
PawConnect/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   ├── sql/
│   ├── package.json
│   └── .env.example
│
├── docs/
├── .gitignore
└── README.md
```

## Planned Modules

- User registration and login
- Animal listing and search
- Animal profile
- Adoption applications
- Appointment requests
- Medical records
- Adoption completion and history
- Admin dashboard

## Database Entities

The initial database design is based on six main entities:

- User
- Animal
- AdoptionApplication
- Appointment
- MedicalRecord
- Adoption

## Branching

Main branches:
- `main`
- `development`

Feature work will be completed in separate branches and merged through pull requests.

Example feature branches:
- `feature/auth`
- `feature/animals`
- `feature/adoption`
- `feature/appointments`

## Initial Setup

Frontend:
```bash
cd frontend
npm install
```

Backend:
```bash
cd backend
npm install
```

Create a local `.env` file for backend database settings using `.env.example`.


