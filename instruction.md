# VirAshelle Landing Page — Setup Instructions

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- Git

---

## 1. Clone the Repository

```bash
git clone https://github.com/naufaleko/VirAshelle-Landing-Page.git
cd VirAshelle-Landing-Page
```

## 2. Install Dependencies

```bash
npm install
```

## 3. Create Environment File

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://pkeojnwapdwvwjdkqwwz.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrZW9qbndhcGR3dndqZGtxd3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2NTMxMjgsImV4cCI6MjEwNTIyOTEyOH0.IRINSfI2CF12PUBnlOc9hlf7owRJRoCWxjhxB-O0RDI
```

## 4. Run Development Server

```bash
npm run dev
```

Buka di browser:

| Halaman | URL |
|---|---|
| Landing Page | `http://localhost:5173` |
| Admin Dashboard | `http://localhost:5173/admin` |

## 5. Git Identity (untuk commit dari PC ini)

```bash
git config user.name "Naufal Eko"
git config user.email "naufaleko7271@gmail.com"
```

---

## Build for Production

```bash
npm run build
```

Output ada di folder `dist/`.

## Deploy to Firebase Hosting

```bash
npm run build
npx firebase deploy --only hosting
```
