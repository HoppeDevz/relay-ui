import { FastifyRequest, FastifyReply } from 'fastify';
import { relayService } from '../services/relay.service';

export class RelayController {
  async getRelayStatus(request: FastifyRequest, reply: FastifyReply) {
    try {
      const status = await relayService.getRelayStatus();
      return status;
    } catch (err: any) {
      request.log.error(err);
      return reply.code(500).send({ error: err.message || 'Internal error' });
    }
  }

  async getRelayConfig(request: FastifyRequest, reply: FastifyReply) {
    try {
      const config = await relayService.getRelayConfig();
      return config;
    } catch (err: any) {
      request.log.warn(err.message || err);
      return reply.code(404).send({ error: err.message || 'Config not found' });
    }
  }
}

export const relayController = new RelayController();
