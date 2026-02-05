import { dbClient } from '../database/db';
import { getConnectionsWithAgentFlag as getConnections } from '../entities/connections';
import { getHttpRequestsForConnection } from '../entities/http-requests';
import { getTransmissionForConnection } from '../entities/transmission-data';

export class ConnectionService {
  async getAllConnections() {
    if (!dbClient.isAvailable()) {
      throw new Error('Database not available');
    }
    return await getConnections();
  }

  async getHttpRequests(connectionId: string, statusFilter?: string) {
    if (!dbClient.isAvailable()) {
      throw new Error('Database not available');
    }
    return await getHttpRequestsForConnection(connectionId, statusFilter);
  }

  async getTransmissionData(connectionId: string) {
    if (!dbClient.isAvailable()) {
      throw new Error('Database not available');
    }
    const row = await getTransmissionForConnection(connectionId);
    if (!row) {
      throw new Error('Connection not found');
    }
    return row;
  }
}

export const connectionService = new ConnectionService();
