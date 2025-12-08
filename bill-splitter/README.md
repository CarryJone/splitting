# Lightweight Bill Splitter

A guest-mode bill splitting application (like Splitwise but no login).
Built with React (Vite), Node.js (Hono), and PostgreSQL (Supabase).

## Prerequisites

- Node.js (v18+)
- A Supabase project (or any PostgreSQL database)

## Setup

### 1. Database Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the SQL Editor in Supabase.
3. Copy the content of `backend/src/db/schema.sql` and run it to create the tables.
4. Get your connection string (Transaction Mode, port 6543) from Project Settings > Database.

### 2. Backend Setup
1. Navigate to `backend`:
   ```bash
   cd backend
   ```
2. Create a `.env` file:
   ```env
   DATABASE_URL="postgres://postgres.xxxx:password@aws-0-region.pooler.supabase.com:6543/postgres"
   ```
3. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```
   Server will start on `http://localhost:3000`.

### 3. Frontend Setup
1. Navigate to `frontend`:
   ```bash
   cd frontend
   ```
2. Install dependencies and run:
   ```bash
   npm install
   npm run dev
   ```
3. Open `http://localhost:5173`.

## Features
- **Create Group**: Generate a unique link for your group.
- **Add Members**: Add names without login.
- **Add Expense**: Record who paid and who splits.
- **Settlement**: Automatically calculate the minimum number of transfers to settle debts.
