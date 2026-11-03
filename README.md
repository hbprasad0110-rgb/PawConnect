# PawConnect

PawConnect is a web application for managing animal shelter adoptions. It gives adopters one place to browse animals, submit an adoption application, schedule a meeting, and follow the progress of an adoption. Shelter staff use the administration screens to review applications, manage appointments, maintain animal and medical information, and record completed adoptions.

This project was developed for CSE 5324 Software Engineering I at The University of Texas at Arlington.

## Team

**Team name:** Group 4 - PawConnect

| Name | Student ID |
| --- | --- |
| Harsha Prasad | 1002230012 |
| Himanshu Shimpi | 1002304702 |
| Dipanjana Das | 1002327740 |

## Main features

### Adopter

- Create an account and sign in
- Reset a forgotten password by email
- Browse and filter available animals
- View an animal profile and health information
- Submit and withdraw adoption applications
- Schedule and cancel appointments after approval
- View application, appointment, and adoption history
- Update profile information

### Administrator

- View shelter totals on the dashboard
- Add animals and update their information or availability
- Add and edit medical records
- Review and approve or reject adoption applications
- Confirm, complete, or cancel appointments
- Complete an adoption after the required appointment
- View adoption and animal-status history

## Architecture

PawConnect follows a three-layer web architecture:

```text
React and Vite frontend
        |
        | HTTP requests to /api
        v
Express and TypeScript backend
        |
        | Knex queries and migrations
        v
MySQL 8.4 database in Docker
```

The frontend is responsible for the adopter and administrator screens. It communicates with the backend through JSON API endpoints and uses an HTTP-only session cookie for authentication. The backend contains the application rules, role checks, validation, email notifications, and database access. MySQL stores users, animals, medical records, applications, appointments, adoptions, password-reset tokens, and animal status history.

During local development, Vite runs on port `5173`, Express runs on port `5000`, and Docker exposes MySQL on port `3307`. Knex migrations create the database tables, while the seed file adds the local demonstration accounts and sample animals.

## Project structure

```text
PawConnect/
|-- frontend/              React pages, components, API client, and browser tests
|-- backend/               Express API, business rules, migrations, seeds, and tests
|-- docs/                  Course reports and system diagrams
|-- compose.yaml           Local MySQL container
|-- start-app.ps1          Local application startup script
|-- .env.example           Example local configuration
`-- package.json           Commands shared by the complete application
```

## Requirements

Install these before setting up the project:

- Node.js 22 or later
- npm
- Docker Desktop
- MySQL Workbench, if direct database access is needed

## First-time setup

Open PowerShell in the project folder.

1. Create the local environment file:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` and replace the example database passwords, JWT secret, and demonstration account passwords. The local database and schema name must remain `pawconnect`. The default Docker port is `3307`.

3. Install the root tools:

   ```powershell
   npm install
   ```

4. Install the frontend and backend dependencies, start MySQL, run the migrations, and load the demonstration data:

   ```powershell
   npm run setup
   ```

The setup command is normally needed only once. The Docker volume keeps the local database data between runs.

## Run the local demonstration

Start Docker Desktop first. Then run this short command from the project folder:

```powershell
npm run app
```

The script checks Docker and the required dependencies before starting the database, backend, and frontend.

- Application: http://localhost:5173
- API health check: http://localhost:5000/api/health
- MySQL: `127.0.0.1:3307`

Use the administrator and adopter email addresses and passwords stored in `.env`. The local login page also provides demonstration login buttons when the application is running in development mode.

Press `Ctrl+C` in the PowerShell window to stop the frontend and backend. The MySQL container can remain running. To stop it as well, run:

```powershell
npm run db:down
```

## MySQL Workbench connection

Create a standard MySQL connection with these values:

| Setting | Value |
| --- | --- |
| Hostname | `127.0.0.1` |
| Port | `3307` |
| Username | Value of `DB_USER` in `.env` |
| Password | Value of `DB_PASSWORD` in `.env` |
| Default schema | `pawconnect` |

The application database user should be used instead of the MySQL root account.

## Useful commands

| Command | Purpose |
| --- | --- |
| `npm run app` | Start the complete local application |
| `npm run dev` | Start the database, backend, and frontend directly |
| `npm test` | Run backend tests, frontend tests, and frontend type checking |
| `npm run test:e2e` | Run the Playwright browser tests |
| `npm run build` | Check that the backend and frontend build successfully |
| `npm run db:status` | Show the local MySQL container status |
| `npm run db:down` | Stop the local Docker services |

## Testing

The project includes unit tests for authentication, validation, error handling, serializers, email templates, and status transitions. The database integration test covers registration, password reset, application review, appointment handling, and adoption completion. Playwright tests check the main adopter and administrator screens on desktop and mobile browser sizes.

Before a class demonstration, run:

```powershell
npm test
npm run test:e2e
```

If both commands pass, start the application with `npm run app` and complete a short manual check of the adopter and administrator accounts.
