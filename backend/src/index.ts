import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import authRoutes from './routes/auth';
import scoreRoutes from './routes/scores';
import profileRoutes from './routes/profiles';
import { createServer } from 'http';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(express.json());

// Configure CORS with specific origin
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://gravity.ahail.work'
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes with /api prefix
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/profiles', profileRoutes);

// Error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  // Detailed logging for both development and production
  console.error('Error details:', {
    path: req.path,
    method: req.method,
    message: err.message,
    name: err.name,
    code: err.code,
    stack: err.stack,
    query: err.query,
    parameters: err.parameters,
    detail: err.detail,
    timestamp: new Date().toISOString()
  });

  // Determine if this is a known error type
  const isKnownError = err.code || err.status || err.name === 'ValidationError';
  
  // For known errors, we can send more specific messages
  if (isKnownError) {
    res.status(err.status || 500).json({
      error: {
        code: err.code || 'VALIDATION_ERROR',
        message: err.message
      }
    });
  } else {
    // For unknown errors, send a generic message in production
    res.status(500).json({
      error: {
        code: 'SERVER_ERROR',
        message: process.env.NODE_ENV === 'development' 
          ? err.message 
          : 'An internal server error occurred. Please try again later.'
      }
    });
  }
});

// 404 handler - must be after all other routes
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: `Cannot ${req.method} ${req.path}`
    }
  });
});

// Start server and initialize database
const PORT = parseInt(process.env.PORT || '3000', 10);
const MAX_PORT_ATTEMPTS = 10;

async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = createServer();
    
    server.on('error', (err: { code: string }) => {
      if (err.code === 'EADDRINUSE') {
        if (startPort < PORT + MAX_PORT_ATTEMPTS) {
          server.listen(++startPort);
        } else {
          reject(new Error('No available ports found'));
        }
      } else {
        reject(err);
      }
    });
    
    server.on('listening', () => {
      const address = server.address();
      if (address && typeof address !== 'string') {
        const port = address.port;
        server.close(() => resolve(port));
      } else {
        reject(new Error('Invalid address type'));
      }
    });
    
    server.listen(startPort, '0.0.0.0');  // Listen on all network interfaces
  });
}

async function startServer(): Promise<void> {
  try {
    // Initialize database
    await initializeDatabase();
    console.log('Database initialized successfully');

    // Find available port
    const availablePort = await findAvailablePort(PORT);
    
    // Start the server
    app.listen(availablePort, '0.0.0.0', () => {  // Listen on all network interfaces
      console.log(`Server running on port ${availablePort}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer(); 