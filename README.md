# Full Distribution System

A distributed medicine distribution system comprising a Backend API, Admin Dashboard, Customer Portal, and Logistics PWA.

## 🚀 Getting Started

### 1. Install Dependencies
Run from the root directory:
```bash
npm install
```

### 2. Database Setup
Ensure you have PostgreSQL running. The system uses Prisma.

Run migration and seed the database (creates default Admin, Hospital Manager, and Driver users):
```bash
# Navigate to the database package
cd packages/database

# Run migrations
npx prisma migrate dev

# Seed the database
npx prisma db seed
```

### 3. Run the Applications
You can run the entire system or specific parts using `turbo`.

**Run Everything (Frontend + Backend):**
```bash
npm run dev
# OR
npx turbo run dev
```

**Run Specific Applications:**
- **Backend API:** `npx turbo run dev --filter=api` (Port 4000)
- **Admin Dashboard:** `npx turbo run dev --filter=admin-dashboard` (Port 3000)
- **Customer Portal:** `npx turbo run dev --filter=customer-portal` (Port 3003)
- **Logistics PWA:** `npx turbo run dev --filter=logistics-pwa` (Port 3002)

## 🔑 Default Credentials

- **Admin Dashboard:** `admin@hq.com` / `password123`
- **Customer Portal:** `manager@hospital.com` / `password123`
- **Logistics Driver:** `driver@logistics.com` / `password123`

> **Note:** On first login, you may be prompted to change your password unless you are using the default seeded accounts (which are configured to bypass this).

## 🛠 Project Structure

- **apps/** (Note: Currently mapped to `Frontend/` and `Backend/` via workspaces)
  - `api`: NestJS Backend
  - `admin-dashboard`: Next.js Admin Panel
  - `customer-portal`: Next.js Hospital Portal
  - `logistics-pwa`: Next.js Driver App
- **packages/**
  - `database`: Prisma schema and client
