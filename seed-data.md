# Seed Data Spec

## Purpose

Populate the database on first boot so the full flow (search, cart, checkout, receipt, report)
is demoable immediately after `docker compose up`, without manual data entry. The seed script
must be idempotent, check whether data already exists before inserting, so container restarts
don't duplicate everything.

## Tenants

Two tenants, deliberately different product categories, so tenant isolation is obvious to
demonstrate live (a cashier from one tenant should see zero products from the other).

1. **Milano Pizza** (pizza + drinks)
2. **Sweet Corner** (pastries + drinks)

## Users (per tenant, known credentials for demo use)

| Tenant | Role | Email | Password |
|---|---|---|---|
| Milano Pizza | admin | admin@milano.test | pass123 |
| Milano Pizza | cashier | cashier@milano.test | " |
| Sweet Corner | admin | admin@sweetcorner.test | " |
| Sweet Corner | cashier | cashier@sweetcorner.test | " |

Passwords hashed with bcrypt at seed time, plaintext documented here (and nowhere else) purely
for demo convenience during the live review.

## Products — Milano Pizza (8-10 items)

Pizzas: Margherita, Pepperoni, Four Cheese, BBQ Chicken, Veggie
Drinks: Coke, Sprite, Water, Ice Tea

**At least one product (e.g. one pizza) must be seeded with `stock: 1`**, specifically to
demonstrate the "two cashiers buy the last unit" scenario live during the review.

## Products — Sweet Corner (8-10 items)

Pastries: Cheesecake, Tiramisu, Croissant, Chocolate Cake, Cinnamon Roll
Drinks: Milkshake, Tea, Cappuccino, Lemonade

**At least one product (e.g. one dessert) must also be seeded with `stock: 1`**, same reason as
above, so the concurrency demo works regardless of which tenant is used live.

## Images

Product images are pre-generated (via Gemini) and hosted by our own backend, not a third-party
image API. Place image files in `backend/public/images/products/`, serve statically:

```js
app.use('/images', express.static(path.join(__dirname, 'public/images')));
```

Reference them in seed data as relative paths, e.g. `/images/products/margherita.jpg`, and
prefix with the API base URL on the frontend when rendering `<img src>`.

Recommended image spec: 800x800px, square (1:1), JPEG, 80-85% quality, roughly 100-200KB per
file after compression. If source images are larger, resize/compress during seeding (e.g. with
`sharp`) rather than shipping oversized files.

## Sample product fields (fill in actual values once images are placed)

```js
{
  name: 'Margherita',
  sku: 'PIZZA-001',
  price: 12,
  costPrice: 4,
  stock: 1,           // deliberately low, for the concurrency demo
  category: 'Pizza',
  imageUrl: '/images/products/margherita.jpg'
}
```

## Seed script requirements

- Written as `backend/src/seed.ts`, run automatically on backend container startup if the
  `Tenant` collection is empty (guard against re-seeding on restart).
- Creates both tenants, all four users (bcrypt-hashed passwords), and all products for both
  tenants in one script.
- Logs the seeded login credentials to the console on completion, for convenience during
  local development and the live review.
