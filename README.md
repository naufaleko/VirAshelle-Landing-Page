# VirAshelle Agency Website

This is a modern, high-impact creative agency portfolio and CMS built with React, Vite, Tailwind CSS, and Firebase.

## Features
- Fully responsive modern design with advanced animations (using `motion/react`)
- Dynamic CMS to manage all sections of the website (Hero, Services, Portfolio, Team, etc.)
- Built-in authentication for the Admin panel
- Integration with Firebase (Firestore for Database, Storage for Images, Auth for Admin login)

## Prerequisites
- Node.js (v18 or higher recommended)
- A Firebase project (if you want to use your own database)

## Local Development Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables (Optional):**
   The project currently uses a default Firebase configuration. If you want to use your own Firebase project (recommended for production):
   - Copy `.env.example` to `.env`
   - Fill in your Firebase configuration values in the `.env` file.
   - You will need to enable Firestore Database, Firebase Storage, and Firebase Authentication (Email/Password) in your Firebase Console.

3. **Run the development server:**
   ```bash
   npm run dev
   ```
   The app will be available at `http://localhost:3000`.

## Building for Production

To build the application for production deployment, run:

```bash
npm run build
```

This will create a `dist/` directory containing the static files for your application.

## Deployment Options

Since this is a client-side SPA (Single Page Application) built with Vite, you can easily host it on any static hosting provider.

### Vercel
1. Push your code to a GitHub/GitLab/Bitbucket repository.
2. Import the project in Vercel.
3. Vercel will automatically detect that it's a Vite project.
4. Add your Environment Variables (from your `.env` file) in the Vercel dashboard.
5. Click **Deploy**.

### Netlify
1. Push your code to a repository.
2. Create a new site from git in Netlify.
3. Build Command: `npm run build`
4. Publish directory: `dist`
5. Add your Environment Variables in Site Settings.
6. Click **Deploy Site**.

### Firebase Hosting
1. Install the Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize hosting: `firebase init hosting`
   - Select your project.
   - What do you want to use as your public directory? `dist`
   - Configure as a single-page app (rewrite all urls to /index.html)? `Yes`
   - Set up automatic builds and deploys with GitHub? `No` (or Yes if preferred)
4. Build the app: `npm run build`
5. Deploy: `firebase deploy --only hosting`

## Accessing the Admin Dashboard

Once deployed (or running locally), you can access the admin panel by navigating to:
`/admin` (e.g., `yourwebsite.com/admin` or `localhost:3000/admin`).

> Note: To create an admin account, you will need to register a user via Firebase Authentication in your Firebase project console.
