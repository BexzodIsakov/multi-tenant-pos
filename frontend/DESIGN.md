# Frontend Design Reference

Reference: a POS dashboard screenshot (order board + payment modal), warm/modern restaurant POS
style. This doc exists so every page (Login, Catalog, Cart, Receipt, Admin Report) stays visually
consistent instead of being restyled ad hoc per component. Tailwind utility classes only, no
component library, per `CLAUDE.md`.

## Color palette

| Role | Tailwind approximation | Usage |
|---|---|---|
| Primary action (gold) | `amber-400` bg, `gray-900` text | Primary buttons ("Pay Bills", "Pay Now", "Add to cart", "Checkout"), active sidebar nav pill |
| Page background | `gray-50` | App shell background behind cards |
| Card / surface | `white` | Product cards, cart panel, sidebar, modals |
| Primary text | `gray-900` | Headings, prices, customer/product names |
| Secondary text | `gray-500` | Timestamps, item labels, "+N more", helper text |
| Border / shadow | `gray-100` border, `shadow-sm` | Card edges, subtle separation, not heavy borders |
| Success badge | `green-100` bg / `green-800` text | "Ready" / "Paid" status |
| Warning badge | `amber-100` bg / `amber-800` text | "In Progress" / "Pending payment" status |
| Neutral badge | `blue-100` bg / `blue-800` text | "Completed" / informational status |
| Accent (secondary) | `teal-800` | Active filter tab, some category badges |

## Typography

- Default sans-serif stack (Tailwind's default `font-sans`), no custom font import needed.
- Page titles: `text-2xl font-semibold text-gray-900`
- Card titles (product/customer name): `text-base font-semibold text-gray-900`
- Body / labels: `text-sm text-gray-500`
- Prices / totals: `font-semibold text-gray-900`, larger size (`text-lg`) for grand totals

## Layout conventions

- **Sidebar nav** (Catalog/Cart/Admin shell): fixed-width left column (`w-60`), white background,
  logo top-left, nav items stacked with icon + label, active item gets a full-width `amber-400`
  rounded pill background with `gray-900` text. User profile (name + role) pinned to the bottom
  of the sidebar, with a logout link/icon just below it.
- **Cards**: `bg-white rounded-xl shadow-sm p-4`, no heavy borders. Grid layout
  (`grid grid-cols-3 gap-4`) for product/order cards.
- **Status badges**: small rounded-full pill, `px-2.5 py-0.5 text-xs font-medium`, colored per
  the table above.
- **Buttons**:
  - Primary: `bg-amber-400 text-gray-900 font-semibold rounded-lg px-4 py-2 hover:bg-amber-500`
  - Secondary/outline: `bg-gray-100 text-gray-700 rounded-lg px-4 py-2 hover:bg-gray-200`
- **Search bar**: rounded-full, `bg-gray-100`, search icon left or right, no visible border.
- **Top bar**: page title left, contextual info (date, filters, search) right-aligned on the same row.

## Mapping to this app's pages

- **Login**: simple centered card on the `gray-50` background, no sidebar.
- **Catalog**: sidebar shell (Catalog / Cart nav, role-aware later for Admin Report) + product
  card grid using the card pattern above, search bar in the top bar, "Add to cart" as the primary
  button on each card.
- **Cart**: right-hand panel or dedicated view styled like the reference's payment modal, item
  list + line prices, totals block, primary "Checkout" button full-width at the bottom.
- **Receipt**: card-style summary, item list + totals, status badge (paid/pending) using the
  badge patterns above.
- **Admin Report**: same shell, cards/stat blocks for revenue and margin instead of order cards.

## What's deliberately not copied from the reference

- No dark mode, out of scope.
- No drag-and-drop, calendar, or table-management features, not part of this app's domain.
- The reference's numeric payment keypad isn't needed, payment is simulated via webhook
  (`docs/05-payment-webhook.md`), not manually entered cash amounts.
