import Fastify from 'fastify';
import path from 'path';
import fastifyStatic from '@fastify/static';
import { dbClient } from './database/db';
import { connectionRoutes } from './routes/connection.routes';
import { requestRoutes } from './routes/request.routes';
import { relayRoutes } from './routes/relay.routes';

const server = Fastify({ logger: true });

// Serve static frontend at root `/` (default index -> connections/index.html)
server.register(fastifyStatic, {
  root: path.join(__dirname, 'view'),
  prefix: '/',
  index: ['index.html'],
});

// Register routes
server.register(connectionRoutes);
server.register(requestRoutes);
server.register(relayRoutes);

const start = async () => {
  try {
    // initialize the database (sql.js WASM). If it fails, routes will return 503.
    try {
      await dbClient.init();
    } catch (err) {
      server.log.warn('Database initialization failed; routes will return 503');
    }
    const port = Number(process.env.PORT) || 3000;
    await server.listen({ port, host: '0.0.0.0' });
    server.log.info(`Server listening on ${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
};

start();
