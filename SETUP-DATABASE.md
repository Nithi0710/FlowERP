# Database Setup (Required for Login)

Login shows **"Invalid credentials"** when the database is not connected or not seeded.

## Option A: Supabase (Recommended — Free, ~2 minutes)

1. Go to [https://supabase.com](https://supabase.com) and create a free project
2. Open **Project Settings → Database**
3. Copy the **URI** connection string (direct connection, port 5432)
4. Paste into `flowerp/.env`:

```env
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

5. Run setup:

```bash
cd flowerp
npm run db:setup
```

6. Restart dev server and login with `admin@shivfurniture.com` / `admin123`

---

## Option B: Local PostgreSQL

If PostgreSQL is installed locally, set password to `password` during install, then:

```bash
cd flowerp
npm run db:setup
npm run dev
```

Your `.env` should have:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/flowerp?schema=public"
```

---

## Verify

```bash
curl http://localhost:3000/api/health
```

Should return: `{"status":"ok","database":"connected","seeded":true}`
