# Amana Mart Backend API

A professional, high-performance backend for the Amana Mart Super App ecosystem.

## Technology Stack
- **Node.js** (v20+)
- **TypeScript**
- **Express** (Framework)
- **Prisma** (ORM)
- **Supabase / PostgreSQL** (Database)
- **JWT** (Authentication)

## Core Modules
1. **Grocery**: Inventory and order management for groceries.
2. **Pharmacy**: Healthcare and medicine delivery logic.
3. **Food**: Restaurant and cafe ordering system.
4. **Shop**: General ecommerce and marketplace APIs.
5. **Courier / Parcel**: Real-time logistics and parcel tracking.
6. **Ride Share + Rental**: Transportation and vehicle rental logic.
7. **Service**: Professional home services marketplace.
8. **Classified**: Bikroy-style buy/sell/rent system.

## Setup Instructions

### 1. Prerequisites
- Node.js installed
- PostgreSQL (or Supabase project)

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env` and fill in your credentials.
```bash
cp .env.example .env
```

### 4. Database Setup
```bash
npx prisma db push
npx prisma generate
npm run seed
```

### 5. Running the API
```bash
# Development
npm run dev

# Production Build
npm run build
npm start
```

## API Documentation
Documentation for all endpoints is available in the [amana-mart-docs](https://github.com/Amanamart/amana-mart-docs) repository.

---
© 2026 Amana Mart. All rights reserved.
