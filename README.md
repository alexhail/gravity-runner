# Gravity Runner

A fast-paced 2D platformer game where you control gravity to navigate through challenging, auto generated tunnel mazes. Built with Phaser 3, TypeScript, and Node.js. Test your skills by flipping gravity, avoiding obstacles, and competing for the highest score on the global leaderboard!

## 🎮 Features

- Dynamic gravity-flipping mechanics
- Procedurally generated endless levels
- Global leaderboard system
- User profiles and achievements
- Responsive design for both desktop and mobile
- Full-screen mode support
- Customizable audio settings
- Persistent game progress

## 🛠️ Tech Stack

### Frontend
- Phaser 3 (Game Engine)
- TypeScript
- Vite (Build tool)
- HTML5 Canvas
- Web Audio API

### Backend
- Node.js
- Express
- TypeORM
- MySQL
- JWT Authentication

## ⚙️ Prerequisites

- Node.js (v18.x or higher)
- MySQL (v8.x)
- Git

## 🚀 Setup Instructions

1. **Clone the repository:**
```bash
git clone https://github.com/alexhail/gravity-runner.git
cd gravity-runner
```

2. **Database Setup:**
```sql
CREATE DATABASE gravity_runner;
```

3. **Frontend Setup:**
```bash
cd frontend
npm install
cp .env.example .env
```

Update `frontend/.env` with:
```
VITE_API_URL=http://localhost:3000
VITE_APP_NAME=Gravity Runner
```

4. **Backend Setup:**
```bash
cd ../backend
npm install
cp .env.example .env
```

Update `backend/.env` with:
```
PORT=3000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_here
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=your_db_username
DB_PASSWORD=your_db_password
DB_DATABASE=gravity_runner
```

5. **Initialize Database:**
```bash
cd backend
npm run typeorm migration:run
```

## 💻 Development

1. **Start Backend Server:**
```bash
cd backend
npm run dev
```

2. **Start Frontend Development Server:**
```bash
cd frontend
npm run dev
```

The game will be available at `http://localhost:5173`

## 🎮 Game Controls

- **Space / Touch**: Flip gravity
- **Left Arrow / A**: Move left
- **Right Arrow / D**: Move right
- **F**: Toggle fullscreen
- **M**: Toggle music
- **S**: Toggle sound effects
- **F1**: Toggle debug overlay (development only)

## 🏗️ Building for Production

1. **Build Frontend:**
```bash
cd frontend
npm run build
```
The build output will be in the `frontend/dist` directory.

2. **Build Backend:**
```bash
cd backend
npm run build
```
The build output will be in the `backend/dist` directory.

## 🌐 Deployment

The project is configured for deployment using GitHub Actions. The workflow files are located in `.github/workflows/`.

### Requirements for Deployment
- A server with Node.js and MySQL installed
- Domain names configured for frontend and backend
- SSL certificates (recommended)
- Environment variables set in GitHub Secrets

For detailed deployment instructions, see `deployment/README.md`.

## 🧪 Testing

```bash
# Run frontend tests
cd frontend
npm run test

# Run backend tests
cd backend
npm run test
```

## 📝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Phaser 3](https://phaser.io/) - HTML5 Game Framework
- [TypeORM](https://typeorm.io/) - ORM for TypeScript
- All contributors who have helped this project grow

## 📞 Support

If you encounter any issues or have questions, please file an issue on the GitHub repository. 
