# Gravity Runner

A fast-paced 2D platformer game where you control gravity to navigate through challenging levels. Built with Phaser 3, TypeScript, and Node.js.

## Features

- Gravity-flipping mechanics
- Procedurally generated levels
- Score tracking and leaderboards
- Responsive design for both desktop and mobile

## Prerequisites

- Node.js (v18.x or higher)
- MySQL (v8.x)

## Setup

1. Clone the repository:
```bash
git clone [repository-url]
cd gravity-runner
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Install backend dependencies:
```bash
cd ../backend
npm install
```

4. Create a MySQL database:
```sql
CREATE DATABASE gravity_runner;
```

5. Configure environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Update the values according to your setup

## Development

1. Start the frontend development server:
```bash
cd frontend
npm run dev
```

2. Start the backend development server:
```bash
cd backend
npm run dev
```

3. Access the game at `http://localhost:5173`

## Building for Production

1. Build the frontend:
```bash
cd frontend
npm run build
```

2. Build the backend:
```bash
cd backend
npm run build
```

## Controls

- Space/Touch: Flip gravity
- Left/Right arrows: Move horizontally

## License

MIT 