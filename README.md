<h1 align="center">🍽️ React Native Recipe App 🍽️</h1>


A full-stack recipe app built with **Expo / React Native** on the frontend and **Express + PostgreSQL (Drizzle ORM)** on the backend. Recipes are pulled live from **TheMealDB**, and a normalized Postgres database is used to seed extra recipe data and to store each user's favorites.

## Highlights

- 🔐 Sign up, sign in, and 6-digit email verification with **Clerk**
- 🍳 Browse featured recipes and filter by category on the Home tab
- 🔍 Search recipes by name or ingredient, with debounced input
- 📖 Recipe detail screen with ingredients and step-by-step instructions
- ❤️ Add/remove favorites, backed by a Postgres `favorites` table via the Express API
- 🗄️ Normalized schema: `categories`, `areas`, `ingredients`, `recipes`, `recipe_ingredients`, `favorites`
- 🌱 `backend/seed.js` script that pulls recipes from TheMealDB and populates the database
- ⏰ Cron job that pings the backend every 14 minutes to keep a free Render instance awake
- 🎨 8 predefined color themes (`mobile/constants/colors.js`)

## Tech Stack

**Mobile** — Expo, Expo Router, React Native, Clerk (auth), `expo-image`, `expo-linear-gradient`

**Backend** — Node.js, Express, Drizzle ORM, PostgreSQL (`pg`), `node-cron`

## Project Structure

```
backend/
  src/
    config/       # env, db connection, cron job
    db/           # Drizzle schema + migrations
    server.js     # Express app & favorites API
  seed.js         # populates the database from TheMealDB

mobile/
  app/            # Expo Router screens ((auth), (tabs), recipe/[id])
  components/     # shared UI components
  services/       # TheMealDB API client
  constants/      # API URL, color themes
  assets/styles/  # per-screen stylesheets
```

## 🧪 Environment Variables

### Backend (`backend/.env`)

```bash
PORT=5001
DATABASE_URL=your_postgres_connection_string
NODE_ENV=development
```

### Mobile (`mobile/app.json` → `expo.extra.clerkPublishableKey`)

Set your Clerk publishable key there, and point `mobile/constants/api.js` at your running backend URL.

## 🔧 Run the Backend

```bash
cd backend
npm install
npm run dev
```

Optionally seed the database with recipes from TheMealDB:

```bash
node seed.js
```

## 📱 Run the Mobile App

```bash
cd mobile
npm install
npx expo start
```
