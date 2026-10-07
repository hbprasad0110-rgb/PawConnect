# PawConnect

Animal Shelter & Adoption Management System

## Project Links

**Figma Prototype**  
https://www.figma.com/make/fPBMyMuMe3CyImle2XkYO4/PawConnect-Web-App-Prototype?code-node-id=0-6&p=f&t=8l5s7iXeDqDcHcfx-0&fullscreen=1

**GitHub Repository**  
https://github.com/hbprasad0110-rgb/PawConnect

**Development Branch**  
`development`

## Technology

- Frontend: React.js, Bootstrap, CSS
- Backend: Node.js, Express.js
- Database: SQL database
- Hosting: Vercel
- Version Control: Git and GitHub

## Application Flow

```text
Home
 |
 +-- Browse Animals
 |     |
 |     +-- Search / Filter Dogs and Cats
 |     |
 |     +-- Animal Details
 |            |
 |            +-- Apply for Adoption
 |            |
 |            +-- Request Appointment
 |
 +-- Login / Sign Up
       |
       +-- Adopter
       |     |
       |     +-- My Applications
       |     +-- My Appointments
       |     +-- Adoption History
       |
       +-- Administrator
             |
             +-- Manage Animals
             +-- Review Adoption Applications
             +-- Manage Appointments
             +-- Manage Medical Records
             +-- Update Animal Status
             +-- View Adoption History
```

## Architecture Flow

```text
User / Administrator
        |
        v
React Frontend
(Home, Login, Animal Listing, Animal Details,
Adopter Dashboard, Admin Dashboard)
        |
        v
REST API
        |
        v
Node.js + Express.js
        |
        +-- Authentication
        +-- Animal Management
        +-- Adoption Applications
        +-- Appointments
        +-- Medical Records
        +-- Adoption Management
        |
        v
SQL Database
        |
        +-- users
        +-- animals
        +-- adoption_applications
        +-- appointments
        +-- medical_records
        +-- adoptions
```

## Main Adoption Flow

```text
Available
   |
   v
Application Pending
   |
   +-- Rejected --> Available
   |
   v
Approved
   |
   v
Adopted
```

## Foster Status Flow

```text
Available
   |
   v
Fostered
   |
   v
Available
```

## Repository Structure

```text
PawConnect/
|
+-- frontend/
|   +-- src/
|       +-- components/
|       +-- pages/
|       +-- services/
|       +-- styles/
|
+-- backend/
|   +-- src/
|       +-- config/
|       +-- controllers/
|       +-- middleware/
|       +-- models/
|       +-- routes/
|       +-- services/
|   +-- sql/
|
+-- docs/
|
+-- README.md
+-- .gitignore
```


