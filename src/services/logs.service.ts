import { dbClient } from '../database/db';
import { getApplicationLogs, getApplicationLogsByLevel, getApplicationLogsCount, getApplicationLogsCountByLevel } from '../entities/application-logs';

export class LogsService {
  async getLogs(level?: number, limit: number = 10, offset: number = 0) {
    if (!dbClient.isAvailable()) {
      throw new Error('Database not available');
    }
    
    let logs;
    let total;
    
    if (level !== undefined) {
      logs = await getApplicationLogsByLevel(level, limit, offset);
      total = await getApplicationLogsCountByLevel(level);
    } else {
      logs = await getApplicationLogs(limit, offset);
      total = await getApplicationLogsCount();
    }
    
    return { logs, total };
  }
}

export const logsService = new LogsService();
