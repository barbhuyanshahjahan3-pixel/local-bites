# Local Bites — Restaurant Dashboard

React + Vite + TypeScript + Tailwind PWA for restaurant staff.

## Setup

```bash
cp .env.example .env   # point VITE_API_URL at your backend
npm install
npm run dev
```

## Login

Restaurant accounts are created by the Super Admin (see the Super Admin app).
Sign in with the access code + temp password you were given, then set a
permanent password on first login.

## Features

- **Orders** — live incoming orders via Socket.IO (with a 15s poll fallback),
  accept/reject with optional reason, progress through preparing → ready for
  pickup. Order history below.
- **Menu** — categories, add/edit/delete food items with Cloudinary image
  upload, base price + optional offer price, veg flag, instant
  availability toggle (86 an item without deleting it).
- **Reports** — sales report by date range: delivered order count, gross
  revenue, platform commission, net payout.

Note: this dashboard intentionally never receives customer phone numbers or
delivery addresses — that's enforced server-side, not just hidden in the UI.

## Icons

Add `public/icons/icon-192.png` and `public/icons/icon-512.png` before
building for production.

## Deployment

Netlify: build command `npm run build`, publish directory `dist`. Set
`VITE_API_URL` to your Render backend URL.
