# FlowERP – Smart Manufacturing ERP & Business Control Tower

Enterprise-grade ERP platform for **Shiv Furniture Works** managing the complete Demand-to-Delivery lifecycle.

## Features

- **Sales Module** — Order creation, confirmation, stock reservation, delivery tracking
- **Procurement Automation** — Auto-generates MO/PO on stock shortage (MTS/MTO)
- **Manufacturing** — BOM, Manufacturing Orders, Work Orders, Work Centers
- **Inventory** — Real-time stock, ledger, procurement queue
- **ERP Control Tower** — Live visual operations flow (judge demo screen)
- **Demand To Delivery Journey** — Animated timeline of order fulfillment
- **Executive War Room** — CEO dashboard with business health score
- **Role-Based Access Control** — Admin, Sales, Purchase, Manufacturing, Inventory, Business Owner

## Tech Stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + Framer Motion
- Prisma ORM + PostgreSQL (Supabase)
- NextAuth.js (Email/Password + Google)
- Recharts, Sonner, React Hook Form, Zod

## Quick Start

### 1. Install dependencies

```bash
cd flowerp
npm install
```

### 2. Configure database (REQUIRED)

**Login will fail without this step.** See [SETUP-DATABASE.md](./SETUP-DATABASE.md) for full instructions.

Quick Supabase setup:
1. Create free project at [supabase.com](https://supabase.com)
2. Copy Database URI to `.env` as `DATABASE_URL`
3. Run: `npm run db:setup`

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Demo Login

| Email | Password | Role |
|-------|----------|------|
| admin@shivfurniture.com | admin123 | Admin |

## Demo Flow (For Judges)

1. **ERP Control Tower** (`/control-tower`) — Show live operations flow
2. Create a **Sales Order** for 20 Wooden Tables (stock is only 5)
3. **Confirm** the order → System auto-detects shortage of 15
4. **Procurement Engine** auto-creates Manufacturing Order
5. View **Demand To Delivery Journey** (`/journey`) — animated timeline
6. Complete MO → Inventory updated → Deliver order
7. Check **Stock Ledger** for full audit trail

## Project Structure

```
src/
├── app/(dashboard)/     # All ERP module pages
├── components/        # UI, layout, forms, special features
├── lib/
│   ├── services/      # Business logic (inventory, sales, etc.)
│   └── actions/       # Server actions for CRUD
└── prisma/
    ├── schema.prisma  # Full ERP data model
    └── seed.ts        # Sample furniture business data
```

## License

Built for Shiv Furniture Works — KAHE Final Project
