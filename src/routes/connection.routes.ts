import { FastifyInstance } from 'fastify';
import { connectionController } from '../controllers/connection.controller';

export async function connectionRoutes(server: FastifyInstance) {
  server.get('/connections', connectionController.getConnections.bind(connectionController));
  server.get('/connections/:id/requests', connectionController.getHttpRequests.bind(connectionController));
  server.get('/connections/:id/transmission', connectionController.getTransmissionData.bind(connectionController));
}
