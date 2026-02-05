import { FastifyRequest, FastifyReply } from 'fastify';
import { requestService } from '../services/request.service';

export class RequestController {
  async getErrorRequestsCount(request: FastifyRequest, reply: FastifyReply) {
    try {
      const result = await requestService.getErrorRequestsCount();
      return result;
    } catch (err: any) {
      request.log.error(err);
      if (err.message === 'Database not available') {
        return reply.code(503).send({ error: err.message });
      }
      return reply.code(500).send({ error: err.message || 'Internal error' });
    }
  }
}

export const requestController = new RequestController();
