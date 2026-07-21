# Local Bites — Admin Dashboard

React + Vite + TypeScript + Tailwind PWA for platform admins.

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

## Login

Admin accounts are created by the Super Admin. Sign in with your access code
+ temp password, then set a permanent password.

## Features

- **Orders** — filter by status, override status, reassign a delivery to a
  different rider (both logged in the order's status history as an admin
  action, not silently).
- **Restaurants** — view and edit name/address/contact/open-status.
- **Delivery Partners** — view and edit name/mobile/vehicle, disable account.
- **Customers** — read-only directory.
- **Complaints** — resolve with a note; customer sees the update in real time
  (backend emits a socket event on resolution).
- **Contact** — phone, support email, Facebook/Instagram/WhatsApp shown to
  customers platform-wide.
- **Analytics** — daily/weekly/monthly order totals, cancellations,
  rejections (split by who rejected), revenue, commission, delivery charges,
  P&L, plus per-restaurant and per-delivery-partner performance tables.

Note: an Admin's access is a strict subset of Super Admin — this dashboard
only calls `/api/admin/*` routes, never `/api/superadmin/*`.

## Icons

Add `public/icons/icon-192.png` and `public/icons/icon-512.png` before
building for production.

## Deployment

Netlify: build command `npm run build`, publish directory `dist`. Set
`VITE_API_URL` to your Render backend URL.
