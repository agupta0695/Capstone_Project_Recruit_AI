# 🚀 Quick Start Guide - HireFlow MVP

## Current Status
✅ Database connection configured (Supabase)
✅ All code files created
✅ Dependencies installed

## Next Steps

### Option 1: Run Database Setup Manually (Recommended)

Open a **new terminal** and run these commands one by one:

```bash
# 1. Generate Prisma Client (already done ✅)
npx prisma generate

# 2. Push database schema to Supabase
npx prisma db push

# 3. Start the development server
npm run dev
```

### Option 2: Use Prisma Studio (Visual Database Tool)

```bash
# Open Prisma Studio to view/manage database
npx prisma studio
```

This opens a web interface at http://localhost:5555 where you can:
- View all tables
- Add/edit data manually
- Verify the schema was created

### Option 3: Skip Database Setup for Now

You can start the dev server without the database and I'll show you how to use mock data:

```bash
npm run dev
```

---

## 🎯 Once the Server is Running

1. **Open your browser:** http://localhost:3000
2. **You'll see:** HireFlow landing page
3. **Click "Sign Up"** to create an account
4. **Fill in the form** and submit
5. **You'll be redirected** to the dashboard

---

## 🐛 Troubleshooting

### If `npx prisma db push` hangs:
- Press `Ctrl+C` to cancel
- Try running it again
- Or use Prisma Studio to verify connection

### If you get "Authentication failed":
- Double-check your Supabase password in `.env`
- Make sure special characters are URL-encoded:
  - `#` becomes `%23`
  - `@` becomes `%40`
  - `&` becomes `%26`

### If the dev server won't start:
```bash
# Clear Next.js cache
rm -rf .next

# Restart
npm run dev
```

---

## 📝 Your Current Configuration

**Database:** Supabase PostgreSQL
**Connection:** db.pmzozniywvmhujzgswgh.supabase.co

**What's Working:**
- ✅ Prisma Client generated
- ✅ Connection string configured
- ✅ All code files ready

**What's Next:**
- Push schema to database
- Start dev server
- Test the MVP!

---

## 💡 Recommended: Run These Commands Now

Open your terminal and run:

```bash
# This should work now
npx prisma db push

# Then start the server
npm run dev
```

Let me know if you encounter any errors! 🚀
