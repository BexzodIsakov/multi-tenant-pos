# Bito POS

A point-of-sale (POS) system for a multi-tenant SaaS. One backend serves multiple independent
businesses (tenants). A cashier logs in, searches the product catalog, builds a cart, places an
order, and the order is confirmed automatically via a simulated payment webhook. An admin (same
tenant) will be able to view a sales report showing revenue and profit margin, a number the
cashier can never reach.

## Status: work in progress

| Stage | What it covers | Status |
|---|---|---|
| 1 | Auth: login, access/refresh JWT, tenant + role middleware | Done |
| 2 | Catalog search: aggregation pipeline, tenant-scoped, cost price hidden from cashiers | Done |
| 3 | Cart: React + Zustand store, checkout request | Done |
| 4 | Order creation: atomic, no-oversell via MongoDB transactions | Done |
| 5 | Payment webhook: HMAC-verified, idempotent, mock payment provider | Done |
| 6 | Receipt endpoint | Not started |
| 7 | Admin sales report + Redis caching | Not started |
| 8 | Seed data polish | Done (runs automatically on backend startup) |
| 9 | Docker Compose | Not started, currently run manually (see below) |

Since Docker isn't wired up yet, everything below is run manually, `mongod` as a local replica
set, backend and frontend each with their own `npm run dev`.

## Tech stack

- **Backend:** Node.js, Express, TypeScript, MongoDB (Mongoose), run as a single-node replica set
  (required for the multi-document transactions in order creation)
- **Frontend:** React, TypeScript, Vite, Tailwind CSS (no component library)
- **Auth:** stateless JWTs, a short-lived access token (15 min) plus a longer-lived refresh token
  (3 days) delivered as an httpOnly cookie

## Running locally

### Prerequisites

- Node.js 20+
- `mongod` / `mongosh` installed locally

### 1. MongoDB as a single-node replica set

Transactions require a replica set, a plain standalone `mongod` will not work.

```bash
mongod --replSet rs0 --dbpath /path/to/some/empty/dir --port 27017
```

In a second terminal, one time only:

```bash
mongosh --port 27017 --eval 'rs.initiate({_id: "rs0", members: [{_id: 0, host: "localhost:27017"}]})'
```

### 2. Environment variables

Copy `.env.example` to `.env` at the project root and fill in random values for each secret
(`ACCESS_TOKEN_SECRET`, `REFRESH_TOKEN_SECRET`, `WEBHOOK_SECRET`).

### 3. Backend

```bash
cd backend
npm install
npm run dev
```

Seeds the database automatically on first boot if it's empty, and logs the demo login
credentials to the console. Runs at `http://localhost:4000`.

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

Runs at `http://localhost:5173`.

## Demo credentials

Two seeded tenants, an admin and a cashier each. Password is the same for all four:

| Tenant | Role | Email |
|---|---|---|
| Milano Pizza | admin | admin@milano.test |
| Milano Pizza | cashier | cashier@milano.test |
| Sweet Corner | admin | admin@sweetcorner.test |
| Sweet Corner | cashier | cashier@sweetcorner.test |

Password: `pass123`

## Design decisions

See `DECISIONS.md` for the reasoning behind tenant scoping, margin protection, concurrency
handling, and other non-obvious tradeoffs, filled in stage by stage as each piece is built.
