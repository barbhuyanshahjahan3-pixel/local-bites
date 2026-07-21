# Deploying Local Bites to Netlify (one site, all 5 apps)

This repo builds all five frontend apps and serves them from a single
Netlify site, on one domain:

| App                | URL path        |
|---------------------|------------------|
| Customer            | `/`              |
| Restaurant dashboard | `/restaurant/`   |
| Delivery partner     | `/delivery/`     |
| Admin dashboard       | `/admin/`        |
| Super Admin dashboard | `/super-admin/`  |

They stay separate apps under the hood (separate logins, separate bundles) —
this just puts them behind one Netlify deployment instead of five.

## 1. Push this folder to a Git repo

Netlify builds best from a connected Git repo (GitHub/GitLab/Bitbucket).
The root of the repo should be this `complete/` folder — i.e. `netlify.toml`,
`package.json`, and `apps/` should sit at the repo root.

## 2. Create the Netlify site

In Netlify: **Add new site → Import an existing project**, pick the repo.
Netlify will auto-detect `netlify.toml`, which already sets:

- Build command: `bash build-netlify.sh`
- Publish directory: `dist`
- Node version: 20

You don't need to change these in the UI.

## 3. Set environment variables

In **Site configuration → Environment variables**, add:

- `VITE_API_URL` — your backend URL on Render, e.g. `https://local-bites-api.onrender.com`
- `VITE_RAZORPAY_KEY_ID` — your Razorpay publishable key (used by the customer checkout)

These are shared across all 5 sub-builds since they all build in the same
Netlify build environment.

## 4. Deploy

Trigger a deploy. The build script (`build-netlify.sh`) will, in order:

1. `npm install && npm run build` inside `apps/customer` → copied to `dist/`
2. Same for `apps/restaurant` → copied to `dist/restaurant/`
3. Same for `apps/delivery` → copied to `dist/delivery/`
4. Same for `apps/admin` → copied to `dist/admin/`
5. Same for `apps/super-admin` → copied to `dist/super-admin/`

`netlify.toml` also includes redirect rules so that refreshing or deep-linking
into any dashboard (e.g. `/admin/orders`) falls back to that dashboard's
`index.html` instead of a 404, while `/` (and any other unmatched path)
falls back to the customer app.

## 5. Backend CORS

Make sure your Express backend's CORS config allows requests from your
Netlify domain (e.g. `https://your-site.netlify.app`) for all 5 apps, since
they all share one origin once deployed this way.

## Local testing before deploying

From this folder:

```bash
npm run build      # runs build-netlify.sh, produces dist/
npx serve dist      # or any static server, to preview all 5 apps together
```

Then visit `http://localhost:3000/`, `/restaurant/`, `/delivery/`,
`/admin/`, `/super-admin/` to check each one.

## Custom domain / subdomains later

If you'd rather split these onto subdomains later (e.g.
`admin.yourbrand.com`, `partner.yourbrand.com`) instead of sub-paths, that's
a straightforward follow-up: split back into 5 Netlify sites (each app
already builds standalone) and point DNS/subdomains at each one. The
`base: '/xxx/'` settings in each `vite.config.ts` would need to be reverted
to `/` for that approach.
