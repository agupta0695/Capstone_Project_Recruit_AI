# HireFlow MVP - Setup Guide

## ✅ What's Been Built

### 1. Authentication System
- **Login Page** (`/auth/login`) - Email/password authentication
- **Signup Page** (`/auth/signup`) - User registration with company info
- **API Routes** - JWT-based authentication
- **Features**: Password hashing (bcrypt), JWT tokens, form validation

### 2. Dashboard
- **Dashboard Page** (`/dashboard`) - Main hub with summary cards
- **Summary Cards**: Active Roles, Pending Approvals, Time Saved
- **Role List Table**: View all job postings
- **Features**: Protected route, logout, responsive design

### 3. Database Schema
- **8 Models**: User, UserSettings, Role, Candidate, Interview, ReasoningLog, Integration
- **Relationships**: Proper foreign keys and cascading deletes
- **Default Settings**: Auto-created on signup

### 4. Infrastructure
- Next.js 14 + TypeScript + Tailwind CSS
- Prisma ORM + PostgreSQL
- JWT Authentication
- HireFlow branding (colors, fonts)

---

## 🚀 Quick Start

### Step 1: Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
# Copy from example
cp .env.example .env
```

Edit `.env` and add:

```env
# Database (use a local PostgreSQL or free tier from Supabase/Neon)
DATABASE_URL="postgresql://user:password@localhost:5432/hireflow"

# NextAuth Secret (generate with: openssl rand -base64 32)
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# OpenAI (for future AI features)
OPENAI_API_KEY="sk-your-key-here"

# AWS S3 (for future resume storage)
AWS_ACCESS_KEY_ID="your-key"
AWS_SECRET_ACCESS_KEY="your-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="hireflow-resumes"
```

### Step 2: Set Up Database

```bash
# Generate Prisma Client
npx prisma generate

# Push schema to database (creates tables)
npx prisma db push

# (Optional) Open Prisma Studio to view data
npx prisma studio
```

### Step 3: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📱 Testing the MVP

### 1. Create an Account
1. Go to http://localhost:3000
2. Click "Sign Up"
3. Fill in:
   - Name: Sarah Verma
   - Email: sarah@techcorp.com
   - Company: TechCorp
   - Password: password123
4. Click "Sign Up"

### 2. View Dashboard
- You'll be redirected to `/dashboard`
- See summary cards (all zeros initially)
- Empty role list with "Create First Role" button

### 3. Test Logout
- Click "Logout" in header
- Redirected to login page

### 4. Test Login
- Use the credentials you created
- Should return to dashboard

---

## 🎯 What's Working

✅ User registration with password hashing
✅ JWT-based authentication
✅ Protected dashboard route
✅ Responsive UI with HireFlow branding
✅ Database models and relationships
✅ Auto-created user settings on signup

---

## 🔜 Next Steps to Complete MVP

### Phase 1: Role Management (Next Priority)
- [ ] Create Role page (`/dashboard/roles/new`)
- [ ] Role detail page (`/dashboard/roles/[id]`)
- [ ] API routes for role CRUD

### Phase 2: Resume Upload
- [ ] File upload component
- [ ] Basic resume parser (extract text)
- [ ] Store candidate profiles

### Phase 3: Simple Evaluation
- [ ] Basic scoring algorithm (keyword matching)
- [ ] Candidate list with scores
- [ ] Shortlist/reject actions

### Phase 4: Candidate View
- [ ] Candidate profile page
- [ ] View parsed resume data
- [ ] Manual override controls

---

## 🐛 Troubleshooting

### Database Connection Error
- Make sure PostgreSQL is running
- Check DATABASE_URL in `.env`
- Run `npx prisma db push` to create tables

### "Unauthorized" Error
- Clear localStorage: `localStorage.clear()` in browser console
- Try logging in again

### Module Not Found
- Run `npm install` again
- Check that all dependencies are installed

### Prisma Client Error
- Run `npx prisma generate`
- Restart the dev server

---

## 📊 Database Quick Reference

### Users Table
- Stores HR user accounts
- Password is hashed with bcrypt
- Linked to UserSettings (1:1)

### UserSettings Table
- Approval gates, thresholds, working hours
- Auto-created on signup with defaults

### Role Table
- Job postings
- Stores evaluation criteria as JSON
- Tracks candidate stats

### Candidate Table
- Candidate profiles (JSON)
- Evaluation results (JSON)
- Status tracking

---

## 🎨 UI Components Available

### Buttons
```tsx
<button className="btn-primary">Primary Action</button>
<button className="btn-secondary">Secondary Action</button>
```

### Cards
```tsx
<div className="card">
  <h3>Card Title</h3>
  <p>Card content</p>
</div>
```

### Colors
- Primary: `#2563EB` (Deep Blue)
- Secondary: `#14B8A6` (Soft Teal)
- Success: `#10B981` (Muted Green)
- Warning: `#F59E0B` (Warm Amber)
- Background: `#FAFAFA`

---

## 💡 Tips

1. **Use Prisma Studio** to view/edit database data:
   ```bash
   npx prisma studio
   ```

2. **Check API responses** in browser DevTools Network tab

3. **JWT Token** is stored in localStorage as 'token'

4. **Database Reset** (if needed):
   ```bash
   npx prisma db push --force-reset
   ```

---

## 🚀 Ready to Continue?

Once you've tested the authentication and dashboard, let me know and I'll build:
1. Role creation and management
2. Resume upload functionality
3. Basic candidate evaluation
4. Candidate list view

This will give you a complete working MVP! 🎯
