import { FastifyRequest, FastifyReply } from 'fastify';
import { connectionService } from '../services/connection.service';

export class ConnectionController {
  async getConnections(request: FastifyRequest, reply: FastifyReply) {
    try {
      const connections = await connectionService.getAllConnections();
      return connections;
    } catch (err: any) {
      request.log.error(err);
      if (err.message === 'Database not available') {
        return reply.code(503).send({ error: err.message });
      }
      return reply.code(500).send({ error: err.message || 'Internal error' });
    }
  }

  async getHttpRequests(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.params as { id: string };
      const query = request.query as { status?: string };
      const requests = await connectionService.getHttpRequests(params.id, query.status);
      return requests;
    } catch (err: any) {
      request.log.error(err);
      if (err.message === 'Database not available') {
        return reply.code(503).send({ error: err.message });
      }
      return reply.code(500).send({ error: err.message || 'Internal error' });
    }
  }

  async getTransmissionData(request: FastifyRequest, reply: FastifyReply) {
    try {
      const params = request.params as { id: string };
      const transmission = await connectionService.getTransmissionData(params.id);
      return transmission;
    } catch (err: any) {
      request.log.error(err);
      if (err.message === 'Database not available') {
        return reply.code(503).send({ error: err.message });
      }
      if (err.message === 'Connection not found') {
        return reply.code(404).send({ error: err.message });
      }
      return reply.code(500).send({ error: err.message || 'Internal error' });
    }
  }
}

export const connectionController = new ConnectionController();
