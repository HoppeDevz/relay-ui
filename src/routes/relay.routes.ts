import { FastifyInstance } from 'fastify';
import { relayController } from '../controllers/relay.controller';

export async function relayRoutes(server: FastifyInstance) {
  server.get('/relay/status', relayController.getRelayStatus.bind(relayController));
  server.get('/relay/config', relayController.getRelayConfig.bind(relayController));
}
