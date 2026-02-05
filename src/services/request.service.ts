import { dbClient } from '../database/db';
import { getErrorRequestsCount } from '../entities/http-requests';

export class RequestService {
  async getErrorRequestsCount() {
    if (!dbClient.isAvailable()) {
      throw new Error('Database not available');
    }
    return await getErrorRequestsCount();
  }
}

export const requestService = new RequestService();
