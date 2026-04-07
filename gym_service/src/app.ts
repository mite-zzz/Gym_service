import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import clientRoutes from './routes/client.routes';
import subscriptionRoutes from './routes/subscription.routes';
import adminRoutes from './routes/admin.routes';
import { errorHandler } from './middlewares/error.middleware';

export function createApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customSiteTitle: '💪 Gym Service API',
    swaggerOptions: { persistAuthorization: true },
  }));
  app.get('/docs.json', (_req, res) => res.json(swaggerSpec));

  app.use('/clients', clientRoutes);
  app.use('/subscriptions', subscriptionRoutes);
  app.use('/admin', adminRoutes);

  app.use(errorHandler);
  return app;
}
