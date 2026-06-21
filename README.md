# 🏭 FlowERP – Smart Manufacturing ERP & Business Control Tower

[![Live Demo](https://img.shields.io/badge/Live%20Demo-View%20Application-blue?style=for-the-badge)](https://flow-erp-ten.vercel.app/)


A production-ready, full-stack ERP platform built for **Shiv Furniture Works**, managing the complete **Demand-to-Delivery** lifecycle — from sales orders to procurement, manufacturing, and inventory — in real time.

FlowERP unifies Sales, Purchase, Manufacturing, and Inventory into a single, intelligent system. When stock runs short, the platform automatically triggers procurement or manufacturing orders, eliminating manual coordination between departments. A live **ERP Control Tower** and **Executive War Room** give every role — from shop floor to CEO — a real-time view of business health.

---

## ✨ Features

### ✅ Sales Module
- Order creation, confirmation, and stock reservation
- Automated delivery tracking
- Customer and order history management

### ✅ Procurement Automation
- Auto-generates Manufacturing Orders (MO) or Purchase Orders (PO) on stock shortage
- Supports both **Make-to-Stock (MTS)** and **Make-to-Order (MTO)** strategies
- Procurement queue with full traceability

### ✅ Manufacturing
- Bill of Materials (BOM) management
- Manufacturing Orders (MO) and Work Orders (WO)
- Work Center scheduling and load tracking

### ✅ Inventory Management
- Real-time stock levels across warehouses
- Full stock ledger with audit trail
- Automated low-stock procurement triggers

### ✅ ERP Control Tower
- Live, visual operations flow — built for real-time demos
- End-to-end visibility from order to delivery

### ✅ Demand-to-Delivery Journey
- Animated timeline tracking every order's lifecycle
- Status transitions: Order → Shortage Detected → MO/PO → Production → Delivery

### ✅ Executive War Room
- CEO-level dashboard with a composite **Business Health Score**
- KPIs across sales, inventory, manufacturing, and fulfillment

### ✅ Role-Based Access Control
- Admin, Sales, Purchase, Manufacturing, Inventory, and Business Owner roles
- Secure, scoped access per module

### ✅ Premium UI/UX
- Glassmorphism and gradient design language
- Smooth Framer Motion animations
- Mobile-first, fully responsive layout
- Toast notifications via Sonner

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Animation** | Framer Motion |
| **Database** | PostgreSQL (Supabase) |
| **ORM** | Prisma |
| **Authentication** | NextAuth.js (Email/Password + Google OAuth) |
| **Validation** | Zod |
| **Forms** | React Hook Form |
| **Charts** | Recharts |
| **Notifications** | Sonner |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- A Supabase project (PostgreSQL)

### 1. Clone and Install

```bash
git clone <repository-url>
cd flowerp
npm install
```

### 2. Configure Environment Variables

> ⚠️ **Login and database operations will fail without this step.**
> See [SETUP-DATABASE.md](./SETUP-DATABASE.md) for complete step-by-step instructions.

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

```dotenv
DATABASE_URL="postgresql://postgres:password@localhost:5432/flowerp?schema=public"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secure-random-string-here"
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
```

**Quick Supabase setup:**
1. Create a free project at [supabase.com](https://supabase.com)
2. Copy the **Database URI** into `.env` as `DATABASE_URL`
3. Copy the **Project URL** and **Anon Key** into the Supabase variables

### 3. Set Up the Database

```bash
npm run db:setup
```

This generates the Prisma client, pushes the schema, and seeds demo data in one step. Alternatively, run each step manually:

```bash
npm run db:generate   # Generate Prisma Client
npm run db:push       # Push schema to database
npm run db:seed       # Seed sample furniture business data
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🔑 Demo Login

| Email | Password | Role |
|---|---|---|
| admin@shivfurniture.com | admin123 | Admin |

---

## 🎬 Demo Flow (For Judges)

1. Open the **ERP Control Tower** (`/control-tower`) to view the live operations flow.
2. Create a **Sales Order** for 20 Wooden Tables (current stock: only 5).
3. **Confirm** the order — the system instantly detects a shortage of 15 units.
4. The **Procurement Engine** automatically creates a Manufacturing Order.
5. View the **Demand to Delivery Journey** (`/journey`) to see the animated fulfillment timeline.
6. Complete the Manufacturing Order — inventory updates automatically.
7. **Deliver** the order to the customer.
8. Check the **Stock Ledger** for a complete, auditable transaction trail.

---

## 📁 Project Structure

```
flowerp/
├── .next/                       # Next.js build output
├── node_modules/
├── prisma/
│   ├── schema.prisma             # Full ERP data model
│   └── seed.ts                   # Sample furniture business data
├── src/
│   ├── app/
│   │   └── (dashboard)/          # All ERP module pages
│   ├── components/                # UI, layout, forms, special features
│   └── lib/
│       ├── services/              # Business logic (inventory, sales, etc.)
│       └── actions/               # Server actions for CRUD operations
├── .env                          # Local environment variables (not committed)
├── .env.example                  # Environment variable template
├── .eslintrc.json
├── .gitignore
├── build-output.log
├── next-env.d.ts
├── next.config.mjs
├── package.json
├── package-lock.json
├── postcss.config.mjs
├── README.md
├── SETUP-DATABASE.md             # Detailed database setup guide
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🗄️ Database Schema

The application is built around the following core models:

- **User** — accounts, roles, and authentication
- **Product** — items including raw materials and finished goods
- **BOM** — Bill of Materials defining product composition
- **SalesOrder** — customer orders and fulfillment status
- **PurchaseOrder** — supplier orders for raw materials
- **ManufacturingOrder** — production runs linked to BOMs
- **WorkOrder** — individual production tasks within a Work Center
- **WorkCenter** — manufacturing stations and capacity
- **StockLedger** — full audit trail of inventory movement
- **Inventory** — real-time stock levels per product/warehouse

---

## 📜 Available Scripts

### Development
```bash
npm run dev          # Start development server
```

### Production
```bash
npm run build        # Build for production
npm run start         # Start production server
```

### Database
```bash
npm run db:setup       # Generate, push schema, and seed in one step
npm run db:generate    # Generate Prisma Client
npm run db:push        # Push schema to database
npm run db:migrate     # Create/apply migrations
npm run db:seed        # Seed demo data
npm run db:studio      # Open Prisma Studio
```

### Quality
```bash
npm run lint          # Run ESLint
```

---

## ✅ Features Implemented

- [x] Authentication (Email/Password + Google OAuth)
- [x] Role-Based Access Control across 6 roles
- [x] Sales Order creation and confirmation
- [x] Automated procurement (MO/PO) on stock shortage
- [x] Manufacturing Orders, Work Orders, and BOM management
- [x] Real-time inventory and stock ledger
- [x] ERP Control Tower live operations view
- [x] Demand-to-Delivery animated journey timeline
- [x] Executive War Room with business health score
- [x] Responsive UI with Framer Motion animations

### 🚧 Planned for Future Enhancement
- AI-based demand forecasting
- Multi-warehouse support
- Supplier performance analytics
- Invoice and payment gateway integration
- Email/SMS notifications
- Multi-language support

---

## 🎨 Design System

### Colors
- **Primary:** Deep Blue `#0F4C81` / Teal `#0D9488`
- **Secondary:** Coral `#FF6B6B` / Warm Orange `#F59E0B`
- **Neutrals:** Slate 50–900

### Typography
- **Font:** Inter
- **Headings:** Bold, 4xl → xl
- **Body:** Base (16px)

### Components
- **Border Radius:** 2xl (16px) for cards
- **Shadows:** Soft, Card, Elevated
- **Animations:** Fade-in, Slide-up, Scale-in (200–300ms)

---

## 🌱 Seeded Demo Data

Running `npm run db:seed` populates the database with:

- 1 Admin account
- Sample products (furniture raw materials and finished goods)
- Predefined Bills of Materials (BOMs)
- Sample sales orders, purchase orders, and manufacturing orders
- Initial inventory and stock ledger entries

---

## ☁️ Production Deployment

For deployment to **Vercel**:

1. Push code to GitHub
2. Import the repository into Vercel
3. Add all required environment variables
4. Deploy

**Required environment variables:**
```
DATABASE_URL
NEXTAUTH_URL
NEXTAUTH_SECRET
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

---

## 🔒 Security Notes

- Never commit `.env` files or secrets to version control
- Keep `NEXTAUTH_SECRET` private and rotate it periodically
- Restrict Supabase row-level security policies before production use
- Protect admin accounts with strong, unique passwords
- Review role-based permissions before granting production access

---

## 📄 License

Private project — All rights reserved.
Built for **Shiv Furniture Works** as a final project (KAHE).

---

Built with ❤️ using **Next.js 14**, **TypeScript**, **Prisma**, **Supabase**, and **Tailwind CSS**.
