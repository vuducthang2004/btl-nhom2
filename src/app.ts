import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import crypto from 'node:crypto';
import routes from './routes/index.js';
import { swaggerSpec } from './config/swagger.js';
import { errorHandler } from './middleware/error-handler.middleware.js';
import { env } from './config/env.js';
import { pool } from './config/database.js';

const app = express();

// Request ID for tracing
app.use((req, _res, next) => {
  req.headers['x-request-id'] = req.headers['x-request-id'] || crypto.randomUUID();
  next();
});

// Security
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN || (env.NODE_ENV === 'production' ? false : '*'),
  credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'development' ? 500 : 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan(env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Swagger API docs
app.get('/swagger-spec.json', (_req, res) => res.json(swaggerSpec));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Coffee Shop API Docs',
}));

// Health check (with DB verification)
app.get('/health', async (_req, res) => {
  try {
    const connection = await pool.getConnection();
    connection.release();
    res.json({ success: true, message: 'Coffee Shop API is running', db: 'connected', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ success: false, message: 'Coffee Shop API is running but database is unreachable', db: 'disconnected', timestamp: new Date().toISOString() });
  }
});

// API routes
app.use('/api/v1', routes);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
