# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Project Context
We are building a QR-based ordering platform with three primary roles:

1. Customer
Scans a QR code to access a specific café’s menu
Selects items and places an order
Completes payment via PhonePe
2. Owner (Café/Branch)
Manages their branch’s menu (add/edit/remove items)
Receives and processes customer orders
Updates order status
Views basic analytics for their café
3. Super Admin
Has full control over the platform
Onboards and manages multiple cafés
Can modify any café’s menu
Monitors all orders across cafés
Accesses analytics for each café 


## Commands

```bash
npm run dev          # Start dev server (port 3000)
npm run build        # Build for production
npm run lint         # ESLint
npx prisma migrate dev     # Run DB migrations
npx prisma generate        # Regenerate Prisma client after schema changes
npx prisma studio          # Open DB GUI
```

Parallel dev servers (each uses an isolated `.next` dist dir):
```bash
npm run dev:owner    # port 3001
npm run dev:admin    # port 3002
npm run dev:customer # port 3003
```

## Architecture

**Stack:** Next.js 16 App Router · TypeScript · PostgreSQL + Prisma 7 · NextAuth 5 (JWT, credentials) · Zustand (cart) · Tailwind CSS 4 · PhonePe payments · Cloudinary images · SSE for real-time updates

### Layered structure

```
src/
├── backend/
│   ├── lib/           # Auth, DB client, PhonePe gateway, SSE manager, notifications
│   ├── repositories/  # Data access (order, menu, payment, admin)
│   └── services/      # Business logic (order, payment, menu, analytics)
├── frontend/
│   ├── components/    # React components split by area: customer/, dashboard/, admin/, ui/
│   ├── hooks/         # useSSE (Server-Sent Events with 3s reconnect backoff)
│   └── stores/        # Zustand: cart (persisted to localStorage)
├── shared/
│   ├── types/         # Shared TypeScript types across frontend/backend
│   └── utils/         # paiseToCurrency(), validation helpers
├── app/
│   ├── api/           # API routes (public + protected)
│   ├── [cafeSlug]/    # Customer-facing pages (menu, order tracking)
│   ├── dashboard/     # Cafe owner UI
│   ├── admin/         # Super admin UI
│   └── login/
└── generated/prisma/  # Generated Prisma client (do not edit)
```

### Multi-tenancy

Cafes are isolated by `slug`. Middleware at `src/middleware.ts` gates `/dashboard` and `/admin` routes by session JWT. Role hierarchy: `SUPER_ADMIN` → `CAFE_OWNER` → `CAFE_STAFF`. Staff only access their assigned cafe's data.

### Key data model facts

- Prices stored in **paise** (Indian paise, 1/100 rupee); use `paiseToCurrency()` for display
- Order statuses: `CREATED → PAYMENT_PENDING → PAID → PREPARING → READY → COMPLETED`
- `Table` model holds per-table QR tokens linking scans to a specific cafe + table
- `AuditLog` tracks entity changes with actor info

### API route layout

| Prefix | Auth | Purpose |
|--------|------|---------|
| `/api/cafes/[slug]/menu` | Public | Customer menu fetch |
| `/api/orders` | Public | Create order, check status |
| `/api/webhooks/phonepe` | Public (HMAC-verified) | Payment callback |
| `/api/dashboard/*` | CAFE_OWNER / CAFE_STAFF | Order mgmt, menu CRUD, analytics, SSE stream |
| `/api/admin/*` | SUPER_ADMIN | Cafe & user management, system analytics |

### Real-time flow

SSE endpoints `/api/dashboard/orders/stream` and `/api/admin/orders/stream` push `new_order`, `order_updated`, and `menu_updated` events. The server-side `SSEManager` in `src/backend/lib/` fans out events per cafe. Client-side `useSSE` hook handles reconnection.

### Payment flow

1. `POST /api/orders` creates order in `PAYMENT_PENDING`, returns PhonePe redirect URL  
2. Customer completes payment on PhonePe  
3. PhonePe POSTs to `/api/webhooks/phonepe`; signature verified, order updated to `PAID`  
4. SSE broadcasts `new_order` to cafe staff dashboard  
5. Optional WhatsApp/SMS/email notifications fired

### Environment variables

See `.env.example`. Required: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_APP_URL`, `PHONEPE_*`. Optional: `CLOUDINARY_*`, `TWILIO_*`, `META_WHATSAPP_*`, `RESEND_API_KEY`.
