# QR Ordering Platform

A multi-tenant QR-based food ordering system for cafes. Customers scan a table QR code, browse the menu, and pay via PhonePe. Cafe owners manage orders and menus in real time. A super admin oversees all cafes on the platform.

**Live Demo:** https://project-n9d3m.vercel.app

---

## Roles

| Role | Access | URL |
|------|--------|-----|
| Customer | Scans QR code to browse menu and place orders | `/{cafeSlug}` |
| Cafe Owner | Manages menu, monitors live orders, views analytics | `/dashboard` |
| Super Admin | Full platform control, onboards cafes, views all orders | `/admin` |

---

## Test Credentials

### Super Admin
| Field | Value |
|-------|-------|
| Email | `admin@cafeorder.com` |
| Password | `Admin@Demo1234` |
| URL | `/login` then `/admin` |

### Cafe Owner (pick any branch)
| Email | Password |
|-------|----------|
| `owner@koramangala.com` | `Owner@Demo1234` |
| `owner@indiranagar.com` | `Owner@Demo1234` |
| `owner@hsr-layout.com` | `Owner@Demo1234` |
| `owner@whitefield.com` | `Owner@Demo1234` |

URL: `/login` then `/dashboard`

### Customer (no login required)
Customers access via QR code or directly through the cafe URL:

| Cafe | URL |
|------|-----|
| Brew & Bites Koramangala | `/koramangala` |
| Brew & Bites Indiranagar | `/indiranagar` |
| Brew & Bites HSR | `/hsr-layout` |
| Brew & Bites Whitefield | `/whitefield` |

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma 7
- **Auth:** NextAuth 5 (JWT, credentials)
- **Payments:** PhonePe
- **Real-time:** Server-Sent Events (SSE)
- **State:** Zustand (cart, persisted to localStorage)
- **Styling:** Tailwind CSS 4
- **Images:** Cloudinary
- **Hosting:** Vercel

---

## Project Structure

```
src/
├── app/
│   ├── [cafeSlug]/          # Customer menu and order tracking pages
│   ├── dashboard/           # Cafe owner portal
│   ├── admin/               # Super admin portal
│   ├── api/                 # All API routes
│   └── login/
├── backend/
│   ├── lib/                 # Auth, DB client, SSE, PhonePe, notifications
│   ├── repositories/        # Data access layer
│   └── services/            # Business logic
├── frontend/
│   ├── components/          # React components (customer, dashboard, admin, ui)
│   ├── hooks/               # useSSE hook with auto-reconnect
│   └── stores/              # Zustand cart store
└── shared/
    ├── types/               # Shared TypeScript types
    └── utils/               # Currency formatting, validation helpers
```

---

## Local Development

### Prerequisites

- Node.js 20+
- PostgreSQL database (or Neon serverless)
- PhonePe developer account (for payments)

### Setup

```bash
# 1. Clone the repo
git clone https://github.com/tanmaysachann/qr-ordering-platform.git
cd qr-ordering-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Fill in DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_APP_URL, PHONEPE_* in .env

# 4. Run migrations
npx prisma migrate dev

# 5. Seed the database with demo cafes and accounts
npx tsx prisma/seed.ts

# 6. Start the dev server
npm run dev
```

App runs at http://localhost:3000

### Parallel Dev Servers

```bash
npm run dev:owner     # Owner dashboard at port 3001
npm run dev:admin     # Admin portal at port 3002
npm run dev:customer  # Customer menu at port 3003
```

---

## Key Features

### Customer
- Scan table QR code to open the cafe menu
- Browse items by category, add to cart
- Place order and pay via PhonePe
- Track order status in real time (SSE)

### Cafe Owner
- Live order feed with SSE push updates
- Accept, prepare, and complete orders
- Full menu CRUD with image uploads (Cloudinary)
- Expense tracking and analytics dashboard
- Staff account management

### Super Admin
- Onboard new cafes and assign owners
- View and manage all cafes, menus, and orders
- Cross-cafe analytics and insights
- User and role management

---

## Order Flow

```
Customer scans QR
      |
POST /api/orders  (status: PAYMENT_PENDING)
      |
PhonePe payment redirect
      |
POST /api/webhooks/phonepe  (HMAC verified, status: PAID)
      |
SSE broadcasts new_order to cafe dashboard
      |
Owner updates status: PREPARING -> READY -> COMPLETED
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string (pooled) |
| `DIRECT_DATABASE_URL` | For migrations | Direct connection, bypasses PgBouncer |
| `AUTH_SECRET` | Yes | NextAuth secret (min 32 chars) |
| `NEXT_PUBLIC_APP_URL` | Yes | Base URL of the deployed app |
| `PHONEPE_MERCHANT_ID` | Yes | PhonePe merchant ID |
| `PHONEPE_SALT_KEY` | Yes | PhonePe salt key |
| `PHONEPE_SALT_INDEX` | Yes | PhonePe salt index |
| `CLOUDINARY_CLOUD_NAME` | Optional | Image uploads |
| `CLOUDINARY_API_KEY` | Optional | Image uploads |
| `CLOUDINARY_API_SECRET` | Optional | Image uploads |
| `TWILIO_*` | Optional | SMS notifications |
| `META_WHATSAPP_*` | Optional | WhatsApp notifications |
| `RESEND_API_KEY` | Optional | Email notifications |

---

## Database

```bash
npx prisma migrate dev       # Run migrations
npx prisma generate          # Regenerate Prisma client after schema changes
npx prisma studio            # Open DB GUI in browser
npx tsx prisma/seed.ts       # Seed demo data
```

Prices are stored in **paise** (1 INR = 100 paise). Use `paiseToCurrency()` from `src/shared/utils/currency.ts` for display.

---

## License

MIT
