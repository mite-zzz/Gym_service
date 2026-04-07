import { createApp } from './app';
import { prisma } from './config/database';
import { env } from './config/env';

async function bootstrap() {
  await prisma.$connect();
  console.log('✅ Database connected');

  const app = createApp();
  app.listen(env.PORT, () => {
    console.log(`🚀 Gym Service running on http://localhost:${env.PORT}`);
    console.log(`📚 Swagger docs: http://localhost:${env.PORT}/docs`);
  });

  process.on('SIGTERM', async () => { await prisma.$disconnect(); process.exit(0); });
  process.on('SIGINT',  async () => { await prisma.$disconnect(); process.exit(0); });
}

bootstrap().catch((e) => { console.error(e); process.exit(1); });
