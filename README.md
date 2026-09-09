# Harkeerat Singh — Developer Portfolio SPA

A high-performance, framework-less Developer Portfolio Single-Page Application (SPA) built from scratch with modern **Vanilla JavaScript (ES6+)**, **Vite**, **Supabase**, and **Groq AI** (`llama-3.3-70b-versatile`).

Designed with a modern **Obsidian Bento & Precision Tech Design System** featuring high-contrast solid obsidian planes, 1px precision hairline borders, dynamic cursor spotlights, and an interactive HTML5 Euclidean node canvas.

---

## ⚡ Tech Stack & Architecture

- **Core**: Vanilla JavaScript (ES6+ Modules, Zero frontend framework bloat)
- **Build Tool**: [Vite](https://vitejs.dev/) (Minified, highly optimized production bundle)
- **Styling**: Pure CSS3 with CSS Custom Properties, CSS Grid, and Flexbox
- **Persistence & Cloud Layer**: [Supabase](https://supabase.com/) PostgreSQL with an offline-first browser `localStorage` fast-read cache and background synchronization
- **AI Integration**: [Groq](https://groq.com/) API (`llama-3.3-70b-versatile`) with offline semantic token-matching fallback
- **Vector Graphics**: Unified SVG Sprite system (`public/icons.svg`)
- **Deployment Ready**: Configured for Vercel SPA rewrites and serverless edge functions (`vercel.json`)

---

## 🚀 Key Features

1. **Hero Section (`#home`)**: Live dynamic statistics counters, featured projects carousel, PDF Resume/CV export triggers, and social links.
2. **Academic & Professional Journey (`#journey`)**: Chronological vertical timeline with glowing indicators for Experience and Education milestones.
3. **Technical Toolkit & Skills (`#skills`)**: Filterable categories with animated proficiency meters.
4. **Featured Projects Hub (`#projects`)**: Technology filter tabs, architecture deep-dives, live demo/repo links, and detail modals.
5. **Certificates & Accreditations (`#certificates`)**: Industry credential cards with full-screen image lightbox and verification links.
6. **Coding Profiles & Problem Solving (`#coding-profiles`)**: Real-time aggregated statistics (2,770+ problems solved, 2,240 peak rating, 365d streak) across LeetCode, Codeforces, CodeChef, and Codolio.
7. **Contact & Inquiries (`#contact`)**: Interactive inquiry dispatcher with client-side rate-limiting and anti-spam cooldown.
8. **Floating AI Technical Representative (`#chatbot`)**: Floating assistant powered by Groq LLaMA 3.3 that answers visitor questions about projects, experience, and system architecture.
9. **Hidden Admin Management Console (`/?admin`)**: Complete CRUD panel protected by client-side SHA-256 password hashing.
10. **Printable ATS Resume & CV (`?print=resume` & `?print=cv`)**: Clean print layout with automated browser print trigger.

---

## 🛠️ Quickstart & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### 2. Installation
```bash
git clone https://github.com/arnav-jain700/harkeerat-portfolio.git
cd harkeerat-portfolio
npm install
```

### 3. Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Production Build
```bash
npm run build
npm run preview
```

---

## 🔐 Admin Console

Access the hidden administrative management panel at:
```
http://localhost:5173/?admin
```
- **Default Security Passcode**: `Harkeerat0904`

From the admin dashboard, you can:
- Add / edit / delete technical skills, projects, timeline milestones, certificates, and coding profiles
- Upload local project cover images and certificate snapshots
- Inspect contact form inquiries and generate AI draft replies
- Manage cloud database backups and Supabase synchronization

---

## 🗄️ Connecting to Supabase

The portfolio is designed with an **offline-first, cloud-synchronized** architecture. It functions out of the box with browser `localStorage` and automatically mirrors state to Supabase when configured.

### Step 1: Create a Free Supabase Project
1. Log in to [Supabase](https://supabase.com/) and click **New Project**.
2. Name your project (e.g., `harkeerat-portfolio`) and set a secure database password.

### Step 2: Create the `portfolio_data` Table
In your Supabase project dashboard, open the **SQL Editor** and run the following script:

```sql
-- 1. Create the portfolio_data table
create table if not exists public.portfolio_data (
  id text primary key,
  data jsonb not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable Row Level Security (RLS)
alter table public.portfolio_data enable row level security;

-- 3. Drop existing policies if they already exist (safe to re-run)
drop policy if exists "Allow public read access" on public.portfolio_data;
drop policy if exists "Allow public insert and update access" on public.portfolio_data;

-- 4. Allow public read access via the anon key
create policy "Allow public read access" on public.portfolio_data
  for select
  using (true);

-- 5. Allow insert and update access via the anon key
create policy "Allow public insert and update access" on public.portfolio_data
  for all
  using (true)
  with check (true);
```

### Step 3: Copy Your API Credentials
In Supabase, navigate to **Project Settings** -> **API**:
- **Project URL** (e.g., `https://xyzcompany.supabase.co`)
- **Project API Keys** -> `anon` / `public` key (`eyJhbGciOi...`)

### Step 4: Link Your Portfolio
You can link Supabase using **either** of these methods:

#### Method A: Via Admin Dashboard (Zero Redeploy)
1. Open `/?admin` on your portfolio.
2. Enter passcode `Harkeerat0904`.
3. Open **Pane E (Supabase Cloud Sync & Backup)**.
4. Paste your **Project URL** and **Anon Key**.
5. Click **Save Supabase Credentials**, then click **Test Connection** followed by **Sync Local Data to Cloud Now**.

#### Method B: Via Environment Variables (Vite & Vercel)
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
```
When deploying to Vercel, add these same keys under **Settings -> Environment Variables**.

---

## 📄 License
MIT License. Created by [Harkeerat Singh](https://github.com/arnav-jain700).
