# Local Bites — Super Admin Dashboard

React + Vite + TypeScript + Tailwind. PWA-enabled (installable, offline app
shell via `vite-plugin-pwa`).

## Setup

```bash
cp .env.example .env   # point VITE_API_URL at your backend
npm install
npm run dev
```

## First run

1. On the backend, run `npm run seed:superadmin` once to create the initial
   Super Admin (see server README). Note the printed access code + temp
   password.
2. Open this app, sign in with that access code + temp password.
3. You'll be forced to set a permanent password.
4. Add your first city (Hojai), then create restaurant and delivery partner
   accounts — each generates a one-time-shown access code + temp password to
   hand off securely.

## Icons

Add `public/icons/icon-192.png` and `public/icons/icon-512.png` (your Local
Bites logo at those sizes) before building for production — the manifest
references them.

## Deployment

Deploy to Netlify: build command `npm run build`, publish directory `dist`.
Set `VITE_API_URL` to your Render backend URL in Netlify's environment
variables.

## Known limitation

`mustChangePassword` state is derived from the login response and isn't
re-derived from a stored JWT on page refresh — if a Super Admin refreshes
mid-password-change, they'll land back on the dashboard (the backend still
enforces `blockIfMustChangePassword` on protected routes either way). Decode
the JWT payload on load if you want this reflected in the UI across refreshes.
