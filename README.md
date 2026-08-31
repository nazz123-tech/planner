# Planly

A personal daily planner web app for organizing tasks and notes. Users sign in,
plan their day from a dashboard, group work into custom boards, and view tasks on
a continuous year calendar. All data is stored per‑user in Firebase and updates
live across the UI.

## Key Features

- **Authentication** – email/password and Google sign‑in via Firebase Auth. A
  user document is created in Firestore on first sign‑in. Private routes are
  guarded and redirect to `/login` when signed out.
- **Dashboard** – a time‑of‑day greeting with a task summary, today's tasks with
  check‑off toggles, and a progress overview of all boards.
- **Tasks & notes** – create tasks (title, description, date, time, category) or
  notes (title, description, category) from a single modal form. Mark tasks done
  with a click.
- **Boards** – tasks and notes grouped into custom categories, each with an
  emoji, color, and name. Board cards show task/note counts and a completion
  progress bar. Boards can be deleted.
- **Calendar** – a scrollable, continuous year‑view calendar with tasks placed on
  their due dates and color‑coded by category.
- **Real‑time sync** – Firestore `onSnapshot` listeners keep tasks, notes, and
  categories in sync across sessions without manual refresh.
- **Form validation** – schema‑based validation with inline error messages and
  toast notifications.

## Tech Stack

- **Framework** – Next.js 16 (App Router), React 19, TypeScript
- **Backend** – Firebase (Authentication + Cloud Firestore); no custom server,
  the client talks to Firestore directly
- **Data / state** – TanStack React Query with real‑time Firestore listeners
- **Forms** – React Hook Form + Yup
- **Styling** – CSS Modules, `next/font` (Source Serif 4, Inter, Space Mono)
- **UI** – lucide-react / react-icons, framer-motion, react-hot-toast
- **Dates** – Day.js
- **Deployment** – Vercel

## Project Structure

```
app/
  (auth)/            login and register routes
  (private)/         guarded app: dashboard, boards, calendar
  components/
    context/         AuthContext (Firebase auth state)
    guard/           AuthGuard (client-side route protection)
    providers/       React Query provider
    forms/           login, register, create task/note, create board + schemas
    ui/              Navigation, Hero, Calendar, BoardCard, Modal, pickers, ...
  hooks/             data hooks for boards, tasks, notes, categories, greetings
  lib/               firebase config, auth functions, greeting logic
  types/             Task, Note, Category, Habit
  shared/            constants (colors, date helpers)
```

Data model (per user): `users/{uid}/tasks`, `users/{uid}/notes`,
`users/{uid}/categories`.

## Getting Started

### Prerequisites

- Node.js 20+
- A Firebase project with Authentication (Email/Password + Google) and Firestore
  enabled

### Environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=
```

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
