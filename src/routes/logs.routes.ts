import { FastifyInstance } from 'fastify';
import { logsController } from '../controllers/logs.controller';

export async function logsRoutes(server: FastifyInstance) {
  server.get('/logs', logsController.getLogs.bind(logsController));
}
