# holisticAF

A full-stack wellness storefront with a web frontend, admin portal, Node/Express backend, and Expo mobile app.

## Projects

| Project | Tech | Dev URL |
|---|---|---|
| Frontend (includes admin) | Vite + React | http://localhost:5177 |
| Backend | Node + Express + MongoDB | http://localhost:4002 |
| Mobile | Expo React Native | Metro: http://localhost:8083 |

> **Note:** The admin portal is part of the frontend. Visit `/admin` after starting the client.

## Quick start

1. Make sure MongoDB is running locally.
2. Seed the database:
   ```bash
   cd server
   npm run seed
   ```
3. Start everything:
   ```bash
   # Backend
   cd server && npm run server

   # Frontend
   cd client && npm run dev

   # Mobile
   cd mobile && npx expo start
   ```
   Or open `holisticAF.code-workspace` in VS Code and run **Terminal → Run Task → start:all**.

## Demo login (dev mode)

Clerk authentication is disabled in local development. Demo accounts let you try protected sections:

| Role | Email | Password | Where to use |
|---|---|---|---|
| Customer | `demo@holisticaf.com` | `demoPassword123` | Frontend login modal |
| Admin | `admin@holisticaf.com` | `adminPassword` | `/admin` page & mobile admin screen |

Click **"Try demo login"** on the frontend login modal or **"Try demo admin login"** on the admin login page.

## Environment files

- `client/.env` — frontend variables including demo credentials
- `server/.env` — backend variables, DB connection, demo/admin credentials

## Favicons

Web favicons are generated in `client/public/` from `favicon.svg`.
