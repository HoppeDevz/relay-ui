import { FastifyRequest, FastifyReply } from 'fastify';
import { logsService } from '../services/logs.service';

export class LogsController {
  async getLogs(request: FastifyRequest, reply: FastifyReply) {
    try {
      const query = request.query as { level?: string; limit?: string; page?: string };
      const level = query.level ? parseInt(query.level) : undefined;
      const limit = query.limit ? parseInt(query.limit) : 10;
      const page = query.page ? parseInt(query.page) : 1;
      const offset = (page - 1) * limit;
      
      const result = await logsService.getLogs(level, limit, offset);
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

export const logsController = new LogsController();
