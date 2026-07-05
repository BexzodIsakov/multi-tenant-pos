import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import { seedDatabase } from './seed';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import orderRoutes from './routes/orders';
import webhookRoutes from './routes/webhooks';
import debugRoutes from './routes/debug';
import { authenticate } from './middleware/authenticate';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(cookieParser());

// Mounted before express.json(): the webhook route needs the raw request
// body (as a Buffer) to verify the HMAC signature, and reads it via its
// own express.raw() middleware. If the global JSON parser ran first, the
// body would already be a parsed object by the time the handler saw it.
app.use('/api/webhooks', webhookRoutes);

app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/images', express.static(path.join(__dirname, '../public/images')));

app.use('/api/auth', authRoutes);

if (process.env.NODE_ENV !== 'production') {
  app.use('/api/debug', debugRoutes);
}

// Every route mounted below this line requires a valid access token.
// The webhook route (Stage 5) has its own signature verification and
// must be mounted above this line, alongside /api/auth.
app.use(authenticate);

app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => seedDatabase())
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
