# Amana Mart Backend API

Centralized backend for the Amana Mart Super App ecosystem.

## Technologies
- **Runtime**: Node.js
- **Language**: TypeScript
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Prisma
- **Auth**: JWT-based RBAC
- **Communication**: REST API (Express)

## The 8 Core Modules
1. **Grocery**: Stock-based marketplace.
2. **Pharmacy**: Healthcare & medicine delivery.
3. **Food**: Restaurant ecosystem.
4. **Shop**: General ecommerce.
5. **Courier System**: Parcel logistics.
6. **Ride Share + Rental**: Transport & vehicle rental.
7. **Service**: Professional home services.
8. **Classified Marketplace**: Buy/Sell/Rent/Jobs.

## Setup
1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` file from `.env.example`.
4. Run `npx prisma generate`.
5. Start development server: `npm run dev`.

## Environment Variables
- `DATABASE_URL`: Connection string for the PostgreSQL database.
- `JWT_SECRET`: Secret key for token signing.
- `SUPABASE_URL` / `SUPABASE_KEY`: Supabase integration keys.

---
© 2026 Amana Mart. All rights reserved.
