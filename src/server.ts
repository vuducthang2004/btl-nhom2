import 'dotenv/config';
import app from './app.js';
import { env } from './config/env.js';
import { testConnection, pool } from './config/database.js';

async function bootstrap(): Promise<void> {
  await testConnection();

  const server = app.listen(env.PORT, () => {
    console.log(`☕ Coffee Shop API running on http://localhost:${env.PORT}`);
    console.log(`📋 Health check: http://localhost:${env.PORT}/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`\n${signal} received. Shutting down gracefully...`);
    server.close(() => {
      console.log('🔒 HTTP server closed');
    });
    await pool.end();
    console.log('🔒 Database pool closed');
    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
