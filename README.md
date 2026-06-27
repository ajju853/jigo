# Jigo - Premium Companion Booking Platform

A full-stack web application built with React (Vite) frontend and Node.js/Express backend.

## Tech Stack

### Frontend (`/`)
- **React 19** with Vite
- **TailwindCSS** for styling
- **Zustand** for state management
- **React Query** for server state
- **React Router v6** for routing
- **Stripe.js** for payments
- **i18next** for internationalization

### Backend (`/backend`)
- **Node.js** with Express
- **Prisma ORM** with PostgreSQL
- **JWT** authentication
- **bcryptjs** for password hashing
- **Socket.IO** for real-time messaging
- **Stripe** for payment processing

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Setup

1. **Clone the repo**
```bash
git clone https://github.com/ajju853/jigo.git
cd jigo
```

2. **Backend Setup**
```bash
cd backend
cp .env.example .env   # Edit with your DB credentials
npm install
npx prisma db push
node prisma/seed.js
npm start
```

3. **Frontend Setup**
```bash
cd ..
npm install
npm run dev
```

4. **Open** `http://localhost:5173` in your browser

### Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@jigo.app | password123 |
| Customer | aarav@example.com | password123 |
| Customer | priya@example.com | password123 |
| Companion | kabir@example.com | password123 |
| Companion | rohan@example.com | password123 |
| Companion | arjun@example.com | password123 |

## Project Structure

```
jigo/
├── src/                  # Frontend source
│   ├── api/              # API client
│   ├── components/       # Reusable UI components
│   ├── pages/            # Page components
│   ├── stores/           # Zustand stores
│   └── config/           # App configuration
├── backend/              # Backend source
│   ├── src/
│   │   ├── controllers/  # Route controllers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # Express routes
│   │   ├── middleware/   # Auth, error handling
│   │   └── utils/        # Helpers (JWT, bcrypt)
│   └── prisma/           # Schema & seed
├── public/               # Static assets
└── package.json          # Frontend dependencies
```

## License

MIT
