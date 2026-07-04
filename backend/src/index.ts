import path from 'path';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { connectDB } from './config/db';
import authRoutes from './routes/auth';
import productRoutes from './routes/products';
import { authenticate } from './middleware/authenticate';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();

app.use(cors({ origin: process.env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

// Every route mounted below this line requires a valid access token.
// The webhook route (Stage 5) has its own signature verification and
// must be mounted above this line, alongside /api/auth.
app.use(authenticate);

app.use('/api/products', productRoutes);

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Backend listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });
