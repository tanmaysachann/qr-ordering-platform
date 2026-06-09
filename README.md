# QR Ordering Platform

A multi-tenant QR-based food ordering system for cafes. Customers scan a table QR code, browse the menu, and pay via PhonePe. Cafe owners manage orders and menus in real time. A super admin oversees all cafes on the platform.

**Live Demo:** https://scanpay-ordering.vercel.app

---

## Roles

| Role | Access | URL |
|------|--------|-----|
| Customer | Scans QR code to browse menu and place orders | `/{cafeSlug}` |
| Cafe Owner | Manages menu, monitors live orders, views analytics | [/dashboard](https://scanpay-ordering.vercel.app/dashboard) |
| Super Admin | Full platform control, onboards cafes, views all orders | [/admin](https://scanpay-ordering.vercel.app/admin) |

---

## Test Credentials

### Super Admin
| Field | Value |
|-------|-------|
| Email | `admin@cafeorder.com` |
| Password | `Admin@Demo1234` |
| URL | [scanpay-ordering.vercel.app/login](https://scanpay-ordering.vercel.app/login) |

### Cafe Owner (pick any branch)
| Email | Password |
|-------|----------|
| `owner@koramangala.com` | `Owner@Demo1234` |
| `owner@indiranagar.com` | `Owner@Demo1234` |
| `owner@hsr-layout.com` | `Owner@Demo1234` |
| `owner@whitefield.com` | `Owner@Demo1234` |

URL: [scanpay-ordering.vercel.app/login](https://scanpay-ordering.vercel.app/login)

### Customer (no login required)
Customers access via QR code or directly through the cafe URL:

| Cafe | URL |
|------|-----|
| Brew & Bites Koramangala | [scanpay-ordering.vercel.app/koramangala](https://scanpay-ordering.vercel.app/koramangala) |
| Brew & Bites Indiranagar | [scanpay-ordering.vercel.app/indiranagar](https://scanpay-ordering.vercel.app/indiranagar) |
| Brew & Bites HSR | [scanpay-ordering.vercel.app/hsr-layout](https://scanpay-ordering.vercel.app/hsr-layout) |
| Brew & Bites Whitefield | [scanpay-ordering.vercel.app/whitefield](https://scanpay-ordering.vercel.app/whitefield) |

---

## Features

### Customer

**Menu Page**
- Cafe hero banner with cover image, gradient overlay, and film-grain texture; falls back to a radial purple glow if no image is set
- Cafe name, address, and opening/closing hours shown in the header
- "Now serving" animated badge with pulsing green dot
- Dynamic page title and meta description per cafe slug; renders a 404 if the slug is not found

**Search**
- Full-text search bar in the hero header, filtering by item name and description simultaneously
- Live results as the user types with result count ("N results for 'query'")
- Clear (×) button when a query is active; category tabs hide during search
- Empty state with illustration when no items match

**Category Tabs**
- Horizontally scrollable tab strip with an "All" tab plus one tab per category
- Only categories that contain at least one item are shown
- Active tab highlighted; tapping a tab scrolls to the top of the list

**Menu Item Cards**
- Item image (108×96, cover-fit, contrast and saturation boosted); emoji placeholder (leaf or drumstick) if no image
- FSSAI-style veg/non-veg indicator dot (green = veg, red = non-veg)
- Item name, description (2-line clamp), and price in INR
- "Add" button transitions into a quantity stepper (minus / count / plus) when added; minus at qty = 1 removes the item
- Card border turns lime-green and glows when item is in cart
- In-cart badge showing quantity with a checkmark
- Image pop animation on each add; ripple ring and lime-green check burst overlay on the image; veg indicator wiggles when in cart

**Real-time Menu Updates**
- SSE connection listens for `menu_updated` events; silently refetches the full menu without a page reload when the owner changes anything

**Cart**
- Cart scoped to the current cafe slug — no cross-cafe contamination
- Persisted to `localStorage` and rehydrated on load
- Floating sticky cart button at the bottom appears as soon as any item is added: shows item count (animated pop badge), total price, and "Tap to view cart" hint; disappears when cart is empty
- Cart bottom sheet: drag handle, item list with quantity steppers and per-line subtotals, "Clear" button, grand total, "Proceed to Checkout" button, and empty state

**Checkout**
- Order summary with per-item breakdown and grand total in lime-green display font
- Name, mobile number (10-digit Indian, WhatsApp-verified), and email fields with inline validation on blur
- Special instructions textarea (optional)
- Idempotency key stored in `sessionStorage` to prevent double charges on retry
- Loading spinner and "Processing..." state on the pay button; error banner for API failures
- Redirects to PhonePe payment gateway; if order already exists, navigates directly to the status page

**Order Status Tracker**
- Auto-polls order status every 5 seconds; stops when order reaches COMPLETED, CANCELLED, or FAILED
- Vertical status timeline: PAID → PREPARING → READY → COMPLETED — current step glows lime-green with a "NOW" badge; completed steps show a purple checkmark; upcoming steps are dimmed
- Header state reflects current status: confirming payment (pulsing clock), in progress (checkmark + status badge), cancelled or failed (red × icon)
- Full-width "Your order is ready! Head to the counter" banner when status transitions to READY
- Audio alert: plays `/notification.mp3` when order becomes READY
- Browser push notification: requests permission on mount; fires a native "Order Ready!" notification when status hits READY, de-duplicated by tag
- Order details panel: item list, special instructions, and total paid

**WhatsApp Notifications**
- Order confirmation sent via WhatsApp after successful payment (Meta `order_confirmation` template)
- Order ready alert sent via WhatsApp when the owner marks the order ready (Meta `order_ready_alert` template)

---

### Cafe Owner (Dashboard)

**Live Orders Feed**
- Today's orders only, scoped to the owner's cafe
- Real-time updates via SSE (`new_order` and `order_updated` events)
- Polling fallback every 8 seconds to handle serverless multi-instance gaps; new orders detected by comparing known IDs against a baseline snapshot taken on first load
- Audio ding on every new order: a synthesized two-note bell (B5 then E6) built with the Web Audio API, with harmonic overtones for a clear, iPhone-message-style chime; AudioContext unlocked on first pointer or keypress to satisfy browser autoplay policy
- "New Order!" animated pulse badge (bell icon) in the header that disappears after 3 seconds
- Manual refresh button
- Status filter tabs: **All Active** (PAID + PREPARING + READY only — completed and cancelled orders are excluded) · **Preparing** · **Ready** · **Completed**
- Responsive order grid: 1 col on mobile, 2 col on medium screens, 3 col on large screens
- Skeleton loading state (6 ghost cards) and empty state illustration

**Order Cards**
- Order number, status badge, and relative time ("Just now", "5m ago", "2h ago")
- Customer name and phone number
- Item list with quantity and per-line subtotal; special instructions shown in italics
- Total amount
- One-tap status progression: PAID → "Start Preparing" · PREPARING → "Mark Ready" · READY → "Complete"
- Cancel button (red, available at any stage before COMPLETED)
- Button-level loading spinner while the status update is in flight

**Menu Management**
- Tab switcher: **Items** (with count) and **Categories** (with count)
- Items: responsive card grid with image thumbnail, veg/non-veg dot, name, description, price, category tag, and availability badge
- Unavailable items rendered at 60% opacity
- Toggle availability per item (Mark Available / Mark Unavailable)
- Edit (pencil) and Delete (trash) buttons on each card; delete requires confirmation
- Add/Edit Item modal:
  - Name, description, price in ₹, veg/non-veg toggle
  - Category picker with inline "create new category" input (supports Enter to submit; new category auto-selected)
  - Image upload: dashed drop zone, click-to-upload, accepts JPEG/PNG/WebP/AVIF; preview with × to remove; "Uploading..." disabled state while Cloudinary processes the file
- Categories: list with name, item count, edit and delete buttons; deleting warns that items will become uncategorised

**Analytics**
- Time range picker: Today / This Week / This Month / This Year / All Time
- Summary cards: Revenue, Orders, Average Order Value (shown only when orders > 0)
- Recent orders list with order number, customer name, status badge, and amount

**Deep Insights**
- Selectable day-window picker
- Summary tiles: Total Orders, Revenue, Average Order Value, Busiest Hour
- Peak hour breakdown, best-selling items, and repeat customer data

**Expense Tracking**
- Time range filter: Today / This Week / This Month / This Year / All Time
- Summary cards: Total Spent, Number of Entries, Top Spending Category
- Category breakdown with relative-width bars sorted by spend (shown when more than one category)
- Expense log: title, category pill, date, amount, and delete button per entry; optional description shown when provided
- Add Expense modal: title, amount, date (defaults to today), category (9 presets: General, Rent, Utilities, Ingredients, Salaries, Equipment, Marketing, Maintenance, Other), and optional description

**Staff**
- Read-only list of staff members assigned to the cafe by the admin
- Responsive: avatar initials card layout on mobile, table on desktop (Name / Age / Mobile)
- Empty state: "Your admin will add staff members here"

---

### Super Admin

**Cafes Overview**
- "Welcome back. Here's what's happening" header
- Top stat cards: Total Revenue, Today's Revenue, Total Orders, Today's Orders — each with coloured accent bar and icon badge
- Cafe grid with store icon, name, slug (URL path), address, active/inactive badge, and counts for orders, menu items, and staff
- QR code button per cafe — opens a modal with the shareable QR code; also auto-opens after creating a new cafe
- Delete/deactivate button per cafe:
  - Cafe with orders: "Deactivate" dialog — preserves order history, shows order count, amber warning box
  - Cafe with no orders: "Permanently Delete" dialog — requires typing the cafe name exactly to enable the delete button
- Entire cafe card is clickable and navigates to the cafe detail page
- Add Cafe modal: cafe name, address, phone, owner name, owner email, owner password (min 6 chars); live slug preview derived from the email as the admin types; "Create Cafe & Owner" button

**Menu Management (Admin)**
- Cafe filter dropdown: All Cafes / Global / per-cafe (shows item count per option; icon changes to match scope)
- Items table: image + veg dot + name + description, price, category, scope badge (blue "Global" pill or grey cafe name pill), availability status, edit and delete actions
- Availability toggle (eye icon with tooltip)
- Add Item and Add Global Item buttons
- Add/Edit Item modal with a cafe-scope selector at the top (changing scope resets category); "Global — appears in all cafes" option; save button label updates to "Add Global Item" for global scope
- Inline "+ New category" toggle inside the category picker: creates a category scoped to the selected cafe or globally; placeholder text updates accordingly
- Categories table: name, scope badge, delete button with confirmation

**All Staff (Admin)**
- Aggregated staff list from all cafes
- Cafe filter tabs (All Branches + one tab per cafe)
- Responsive: card layout on mobile, table on desktop (Name / Branch / Age / Mobile)

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
SSE broadcasts new_order → owner dashboard dings + badge flashes
      |
WhatsApp confirmation sent to customer
      |
Owner updates status: PREPARING → READY → COMPLETED
      |
WhatsApp pickup alert sent to customer when READY
      |
Customer audio + push notification fires on status page
```

---

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL via Prisma 7
- **Auth:** NextAuth 5 (JWT, credentials)
- **Payments:** PhonePe
- **Real-time:** Server-Sent Events (SSE) with 3-second reconnect backoff
- **State:** Zustand (cart, persisted to localStorage)
- **Styling:** Tailwind CSS 4
- **Images:** Cloudinary
- **Notifications:** Meta WhatsApp Business API (approved templates)
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
| `META_WHATSAPP_TOKEN` | Optional | WhatsApp Business API token |
| `META_WHATSAPP_PHONE_ID` | Optional | WhatsApp sender phone number ID |
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
