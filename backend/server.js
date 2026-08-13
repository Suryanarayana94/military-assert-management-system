import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import prisma from './config/prisma.js';
import authRoutes from './routes/authRoutes.js';
import assetRoutes from './routes/assetRoutes.js';
import purchaseRoutes from './routes/purchaseRoutes.js';
import transferRoutes from './routes/transferRoutes.js';
import assignmentRoutes from './routes/assignmentRoutes.js';
import expenditureRoutes from './routes/expenditureRoutes.js';
import auditRoutes from './routes/auditRoutes.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';

if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET must be configured.');

const app = express();
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || true }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/api/health', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: 'ok', service: 'sentinel-api', database: 'connected' });
  } catch (error) { next(error); }
});
app.use('/api/auth', authRoutes);
app.use('/api', assetRoutes);
app.use('/api/purchases', purchaseRoutes);
app.use('/api/transfers', transferRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/expenditures', expenditureRoutes);
app.use('/api/audit-logs', auditRoutes);
app.use(notFound);
app.use(errorHandler);

if (!process.env.VERCEL) {
  const port = Number(process.env.PORT || 4000);
  app.listen(port, () => console.log(`Sentinel API listening on port ${port}`));
}

export default app;
