import cors from 'cors';
import express from 'express';
import { config } from './config.js';
import restaurantsRouter from './routes/restaurants.js';
import deliveryRouter from './routes/delivery.js';
import ordersRouter from './routes/orders.js';

export function createApp() {
  const app = express();

  app.use(cors({ origin: config.clientOrigin, credentials: true }));
  app.use(express.json());

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, service: 'gluttony-server' });
  });

  app.use('/api/restaurants', restaurantsRouter);
  app.use('/api/delivery', deliveryRouter);
  app.use('/api/orders', ordersRouter);

  app.use((error, _req, res, _next) => {
    res.status(500).json({ error: error.message || 'Unexpected server error.' });
  });

  return app;
}
