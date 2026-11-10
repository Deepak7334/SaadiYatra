# ShaadiYatra (शादी यात्रा)

> **Bihar's Multi-Vendor Wedding & Event Vehicle Booking Marketplace**

ShaadiYatra is a full-stack platform that allows families to book multiple wedding vehicles (luxury bridal cars, grand Baraat SUVs, tempo travellers, and buses) together under **one single booking**.

---

## 🚀 Key Features

- **Multi-Vehicle Event Cart**: Select multiple vehicles from different owners for the same date and submit one combined booking.
- **5-Step Approval Flow**:
  1. **Customer Request**: Submit multi-vehicle booking with event date and location.
  2. **Owner Review**: Each vehicle owner independently accepts or rejects their vehicle.
  3. **Admin Authority**: Super Admin approves selected vehicles and finalizes the advance amount.
  4. **Online Advance Payment**: Customer pays 25% advance securely via Razorpay.
  5. **Guaranteed Booking**: Server cryptographically verifies payment and locks vehicles on the calendar.
- **Anti-Double Booking**: Real-time calendar availability engine prevents conflicting reservations.
- **Role-Based Panels**:
  - **Customer Panel**: Search fleet, cart checkout, track approvals, pay advance, download receipts.
  - **Vehicle Owner Panel**: Manage fleet, accept/reject booking requests, block calendar dates, view earnings.
  - **Super Admin Panel**: Platform analytics, owner KYC verification, vehicle approvals, master booking manager.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, React Router v6
- **Backend**: Cloudflare Workers, Hono.js, TypeScript REST API
- **Database**: Cloudflare D1 (SQLite) with Drizzle ORM (18 normalized tables)
- **Payment**: Razorpay (order creation & server-side HMAC signature verification)
- **Security**: PBKDF2 password hashing & session JWT authentication

---

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
npm run build:shared
```

### 2. Setup Local Database & Seed Data
```bash
cd backend
npx wrangler d1 execute shaadiyatra-db --local --file=drizzle/0000_init.sql
npx wrangler d1 execute shaadiyatra-db --local --file=drizzle/0001_seed.sql
cd ..
```

### 3. Start Development Servers

Run backend (Port 8787):
```bash
npm run dev:backend
```

Run frontend (Port 5173):
```bash
npm run dev:frontend
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔑 Demo Accounts

Use these pre-seeded accounts to explore the dashboards:

| Role | Email | Password | Panel |
|---|---|---|---|
| **Super Admin** | `admin@shaadiyatra.in` | `AdminPassword123!` | `/admin` |
| **Vehicle Owner** | `rajesh.patna@shaadiyatra.in` | `OwnerPassword123!` | `/owner` |
| **Customer** | `rohit.verma@gmail.com` | `CustomerPassword123!` | `/customer/bookings` |

*(Quick one-click login buttons are also provided directly on the `/login` page.)*

---

## 🧪 Run Automated Workflow Test

To verify the complete 5-step booking and payment verification process:
```bash
cd backend
npx tsx src/testWorkflow.ts
```

---

## 📄 License

MIT License. Built for weddings and celebrations across Bihar, India.
