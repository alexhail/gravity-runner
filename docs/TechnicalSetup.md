# Technical Setup Guide

## Development Environment Requirements

- Node.js (v18.x or higher)
- TypeScript (v5.x)
- MySQL (v8.x)
- Git

## Project Structure

```
gravity-runner/
├── frontend/                 # Frontend application
│   ├── src/
│   │   ├── game/           # Game-specific code
│   │   │   ├── scenes/    # Phaser scenes
│   │   │   ├── objects/   # Game objects
│   │   │   └── config.ts  # Game configuration
│   │   ├── assets/        # Game assets (sprites, audio)
│   │   └── types/         # TypeScript type definitions
│   ├── public/            # Static files
│   └── package.json       # Frontend dependencies
├── backend/                # Backend server
│   ├── src/
│   │   ├── routes/       # API routes
│   │   ├── models/       # Database models
│   │   └── config/       # Server configuration
│   └── package.json      # Backend dependencies
└── docs/                  # Project documentation
```

## Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

### Key Frontend Dependencies
- Phaser (v3.60.0 or latest)
- TypeScript
- Vite (for development server and building)
- ESLint + Prettier (code formatting)

## Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

### Key Backend Dependencies
- Express.js
- TypeScript
- MySQL2
- TypeORM
- dotenv (environment configuration)
- cors (Cross-Origin Resource Sharing)

## Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE gravity_runner;
```

2. Configure environment variables:
Create `.env` files in both frontend and backend directories:

Frontend `.env`:
```
VITE_API_URL=http://localhost:3000
```

Backend `.env`:
```
PORT=3000
DB_HOST=localhost
DB_USER=your_username
DB_PASS=your_password
DB_NAME=gravity_runner
JWT_SECRET=your_secret_key
```

## Development Workflow

1. Start the development server:
```bash
# Frontend
cd frontend
npm run dev

# Backend
cd backend
npm run dev
```

2. Access the game:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Build for Production

```bash
# Frontend
cd frontend
npm run build

# Backend
cd backend
npm run build
```

## Code Style Guidelines

- Use TypeScript strict mode
- Follow ESLint rules
- Use Prettier for code formatting
- Write JSDoc comments for functions
- Follow Phaser's best practices for scene management

## Version Control

- Use feature branches
- Follow conventional commits
- Create pull requests for review
- Keep commits atomic and well-documented

## Testing

- Unit tests with Jest
- Integration tests for API endpoints
- Game logic testing using Phaser's test utilities

## Deployment

1. Frontend:
   - Build the frontend assets
   - Deploy to a static hosting service (e.g., Vercel, Netlify)

2. Backend:
   - Deploy to a Node.js hosting service (e.g., DigitalOcean, Heroku)
   - Set up environment variables
   - Configure MySQL database connection

3. Database:
   - Set up MySQL database on a cloud provider
   - Configure backup and recovery procedures
   - Set up proper security measures 