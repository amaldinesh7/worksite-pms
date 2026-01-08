import 'dotenv/config';
import { buildApp } from './app';

const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = process.env.HOST || '0.0.0.0';

const start = async () => {
  const app = await buildApp({ logger: true });

  try {
    await app.listen({ port: PORT, host: HOST });
    console.log(`🚀 Construction PMS API running at http://localhost:${PORT}`);
    console.log(`📚 API docs at http://localhost:${PORT}/api`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();
