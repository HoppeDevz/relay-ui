import { FastifyInstance } from 'fastify';
import { requestController } from '../controllers/request.controller';

export async function requestRoutes(server: FastifyInstance) {
  server.get('/requests/errors', requestController.getErrorRequestsCount.bind(requestController));
}
