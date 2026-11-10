# ShaadiYatra (शादी यात्रा)

**Bihar's Premier Multi-Vendor Wedding & Event Vehicle Booking Marketplace**

ShaadiYatra is a production-grade full-stack web application designed for booking multiple vehicles (luxury groom arrival cars, grand Baraat SUV convoys, tempo travellers, and Baraati buses) together under **one unified booking**.

Initially built with tailored support for Bihar's cities and towns (Patna, Gaya, Muzaffarpur, Bhagalpur, Darbhanga, etc.), its architecture is fully extensible nationwide.

---

## 🌟 Key Features

1. **Multi-Vehicle Unified Cart & Booking**
   - Book multiple vehicles from independent owners for the same celebration date in one combined booking.
   - Individual booking items preserve pricing snapshots (`snapshot_data_json`) so future price edits never affect active contracts.
2. **5-Step Booking Approval Workflow**
   - **Step 1: Customer Booking Request**: Select vehicles, event date, Bihar district, and pickup/destination coordinates.
   - **Step 2: Owner Notifications**: Each vehicle owner receives an alert containing only their vehicle request and can independently accept or reject.
   - **Step 3: Super Admin Authority**: Admin reviews owner responses, can approve/reject individual vehicles (partial bookings), and finalizes the advance amount.
   - **Step 4: Advance Payment (Razorpay)**: Customer pays the configurable advance (e.g. 25%) online via Razorpay (UPI, NetBanking, Cards).
   - **Step 5: Server-Side Payment Verification & Confirmation**: Server cryptographically verifies the Razorpay signature, transitions booking to `CONFIRMED`, locks the vehicles on the calendar, and generates a printable invoice receipt.
3. **Anti-Double Booking & Concurrency Locks**
   - Date-wise availability engine prevents vehicles from being double-booked.
   - Temporary holds during booking prevent collision.
   - Confirmed bookings permanently lock dates on the vehicle's calendar.
4. **Three Dedicated Dashboards with Role-Based Access Control (RBAC)**
   - **Customer Panel**: Cart, booking history, progress stepper, online advance payment, printable receipt.
   - **Vehicle Owner Panel**: Fleet management, vehicle submission (with pending admin approval), accept/reject booking requests, availability calendar date blocking, earnings summary.
   - **Super Admin Dashboard**: Real-time analytics KPIs, owner KYC document verification, vehicle listing approvals, master multi-vehicle booking review desk, platform financial parameters.
5. **Modern Wedding Aesthetic Design**
   - Brand palette: Deep Navy (`#0B132B`), Champagne Gold (`#D4AF37`), Warm Ivory (`#FDFBF7`), and Wine Red accents.
   - Typography: Playfair Display / Cinzel for royal headings & Plus Jakarta Sans for clean data interfaces.

---

## 🏗️ Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v6, TanStack Query, Context API.
- **Backend**: Cloudflare Workers, Hono.js, TypeScript, REST API architecture.
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM and normalized relational schemas across 18 tables.
- **Storage**: Cloudflare R2 bucket binding (`STORAGE`).
- **Authentication**: Secure session JWTs, PBKDF2 password hashing with WebCrypto.
- **Payments**: Razorpay order creation & server-side HMAC-SHA256 signature verification.

---

## 📁 Repository Structure

```
c:\SaadiYatra
├── backend/                  # Cloudflare Workers API with Hono.js & D1
│   ├── drizzle/              # SQL migrations & seed data
│   │   ├── 0000_init.sql     # 18 relational tables & indexes DDL
│   │   └── 0001_seed.sql     # Realistic Bihar vehicles, owners & admin
│   ├── src/
│   │   ├── db/               # Drizzle ORM schema, relations & connection
│   │   ├── middleware/       # Auth JWT verification & RBAC
│   │   ├── routes/           # REST endpoints (auth, vehicle, booking, owner, admin, payment)
│   │   ├── services/         # Notifications & alerts
│   │   ├── utils/            # WebCrypto helpers (PBKDF2, JWT, Razorpay HMAC)
│   │   ├── index.ts          # Main Hono worker
│   │   └── testWorkflow.ts   # Automated end-to-end integration test
│   ├── drizzle.config.ts     # Drizzle Kit configuration
│   ├── wrangler.toml         # Cloudflare Workers, D1 & R2 bindings
│   └── package.json
│
├── frontend/                 # React 18 + Vite + Tailwind CSS SPA
│   ├── src/
│   │   ├── components/       # Navbar, Footer, VehicleCard
│   │   ├── context/          # AuthContext, CartContext
│   │   ├── lib/              # API Client (typed fetch wrappers)
│   │   ├── pages/            # Home, Vehicles, VehicleDetail, Cart, Login, Register, RegisterOwner
│   │   │   ├── customer/     # CustomerBookings, BookingDetail
│   │   │   ├── owner/        # OwnerDashboard
│   │   │   └── admin/        # AdminDashboard
│   │   ├── App.tsx           # Route definitions & protected routes
│   │   ├── main.tsx
│   │   └── index.css         # Custom luxury theme styles
│   ├── vite.config.ts        # Vite configuration with API proxy
│   ├── tailwind.config.js    # Wedding theme color palette
│   └── package.json
│
├── shared/                   # Shared TypeScript contracts & Bihar constants
│   ├── src/
│   │   ├── index.ts          # DTOs, Enums, Booking types
│   │   └── constants.ts      # Bihar districts, Event types, Default settings
│   └── package.json
│
└── package.json              # Root npm workspace
```

---

## 🔑 Demo Accounts (Pre-Seeded)

For rapid local evaluation, the database comes pre-seeded with tested accounts across all three user roles:

| Role | Email | Password | Details |
|---|---|---|---|
| **Super Admin** | `admin@shaadiyatra.in` | `AdminPassword123!` | Full control, booking review, KYC approval |
| **Vehicle Owner (Patna)** | `rajesh.patna@shaadiyatra.in` | `OwnerPassword123!` | Patna Royal Travels (Scorpios, Mercedes, Urbania) |
| **Vehicle Owner (Mithila)** | `amit.mithila@shaadiyatra.in` | `OwnerPassword123!` | Mithila Wheels (Fortuner, Luxury Coaches) |
| **Customer** | `rohit.verma@gmail.com` | `CustomerPassword123!` | Verified customer account (Patna) |

*(Quick one-click demo login buttons are also provided directly on the `/login` screen!)*

---

## 🚀 Running Locally

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **npm**: v9+

### 2. Install Dependencies
Dependencies across root, backend, frontend, and shared are managed as an npm workspace:
```bash
npm install
```

### 3. Build Shared Library
```bash
npm run build:shared
```

### 4. Initialize Local Cloudflare D1 Database & Seed
```bash
cd backend
npx wrangler d1 execute shaadiyatra-db --local --file=drizzle/0000_init.sql
npx wrangler d1 execute shaadiyatra-db --local --file=drizzle/0001_seed.sql
cd ..
```

### 5. Start Development Servers

In terminal 1 (Backend API on `http://localhost:8787`):
```bash
npm run dev:backend
```

In terminal 2 (Frontend UI on `http://localhost:5173`):
```bash
npm run dev:frontend
```

Now open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Automated End-to-End Workflow Verification

A complete integration script is included that tests all 9 phases of the booking lifecycle against live D1 records:
```bash
cd backend
npx tsx src/testWorkflow.ts
```
This automatically verifies:
1. Customer authentication
2. Fetching available vehicles
3. Submitting a combined multi-vehicle booking
4. Vehicle owner notification and acceptance
5. Admin review, approval, and 25% advance order generation
6. Razorpay payment order creation
7. Server-side payment signature verification & booking confirmation
8. Anti-double booking calendar locking

---

## ☁️ Cloudflare Production Deployment

### 1. Cloudflare D1 Database Setup
```bash
npx wrangler d1 create shaadiyatra-db
npx wrangler d1 execute shaadiyatra-db --remote --file=drizzle/0000_init.sql
npx wrangler d1 execute shaadiyatra-db --remote --file=drizzle/0001_seed.sql
```

### 2. Cloudflare R2 Storage Setup
```bash
npx wrangler r2 bucket create shaadiyatra-uploads
```

### 3. Deploy Backend Worker
```bash
cd backend
npx wrangler deploy
```

### 4. Deploy Frontend (Cloudflare Pages)
```bash
cd frontend
npm run build
npx wrangler pages deploy dist --project-name=shaadiyatra
```
