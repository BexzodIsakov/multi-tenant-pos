# DECISIONS.md

## 1. How tenant + role flow through the system

`tenantId` and `role` live only in the JWT, set at login. `User.findOne({ email })` is the one
query in the codebase without a tenant filter, since the tenant is discovered from the email.
Everywhere else, queries filter on `req.auth.tenantId`, sourced only from a verified token.

Auth uses two stateless JWTs: a 15 minute access token (`Authorization` header) and a 3 day
refresh token (httpOnly cookie), which mints new access tokens by copying claims directly, no DB
lookup. Cost: a role change won't take effect until the refresh token expires, and logout can't
revoke a copied token early. Both are deliberate, accepted tradeoffs over a Redis session store.

## 2. N+1 fix and the indexes (field order + why)

Catalog search replaced a per-result query loop with one `$facet` aggregation: a single round
trip returns the paginated page and total count together. Two compound indexes support it,
`{ tenantId: 1, name: 'text' }` and `{ tenantId: 1, createdAt: -1 }`, `tenantId` first since it's
an equality filter on every query, narrowing to one tenant before the heavier text search or sort
runs. The `createdAt` index exists because the text index doesn't help the no-search browse path.

## 3. What's trusted from the client cart vs. re-derived on the server

The client cart sends only `{ productId, quantity }`, price isn't part of the request schema at
all, not even as an ignored field. Price and `costPrice` are re-read from the database inside the
same transaction that decrements stock, so the charged amount can never be a stale or manipulated
client value. The cart's displayed price/stock is a UX nicety only, disabling `+` near visible
limits, the server is the only real gate.

## 4. The no-oversell guarantee under concurrency, and where it breaks

A MongoDB transaction wraps a conditional `findOneAndUpdate` (`stock: { $gte: quantity }`) per
item, retried on `TransientTransactionError`. The conditional update alone solves "two cashiers,
last unit" for one document; the transaction makes a multi-item cart all-or-nothing, if item 2
fails after item 1 succeeded, everything aborts, no orphaned order. Cost, not breakage:
transactions hold per-document locks for their duration, so a large cart holds locks longer than a
single update would, acceptable at POS scale.

Added beyond the original plan: validating `productId`/`quantity` before the transaction starts.
A negative quantity would otherwise satisfy `stock: { $gte: quantity }` and `$inc` would increase
stock, a real exploit.

## 5. How margin is blocked at the data layer for cashiers

Inclusion-style projections (`PRODUCT_SAFE_PROJECTION`, and the `Order` equivalent) are the one
shared source of truth for cashier-reachable fields. `costPrice`/`totalCost` are never listed, so
Mongo can't return what isn't projected, nothing to leak via a future ad hoc field list. Even the
order-creation response strips `costPrice` from the in-memory items array before replying, rather
than trusting a freshly-read document's projection, so cost never appears there either, despite
the `Order` document legitimately storing it for the admin report.

## 6. Webhook idempotency + out-of-order handling

The HMAC signature is verified first, before any DB access or full JSON parsing, using
`timingSafeEqual`, with a length check guarding against mismatched-length buffers, which throw
rather than fail closed. Idempotency comes from a unique index on `PaymentEvent.eventId`, not a
read-then-write check: a duplicate delivery's insert throws Mongo's `11000` error, caught and
turned into `already_processed`. A read-then-write check would leave a race window where two
concurrent deliveries could both pass before either writes; the unique index closes that at the
database level. Wrong-tenant and unknown-order both return an identical `404`, to avoid leaking
cross-tenant existence through the error shape.

## 7. The missing-tenant decision

A missing or unrecognized `tenantId` is an authentication failure, rejected with `401` in
`authenticate`, before any controller or query runs, not a per-controller check. Deliberately not
verified: whether the tenant still exists in the DB on every request, that would cost a round trip
per call. Tokens are only issued for real tenants at login, so a hard-deleted tenant's still-live
token would just return empty results everywhere, a small accepted blast radius instead of an
active existence check on the hot path.

## 8. What was prioritized under time pressure, and one thing to push back on

(To be filled in once the remaining stages are built and the full tradeoff picture is clear.)
