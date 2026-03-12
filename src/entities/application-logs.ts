  import { dbClient } from '../database/db';

export type ApplicationLog = {
  id: number;
  level: number;
  message: string;
  updated_at: string;
  created_at: string;
};

export async function getApplicationLogs(limit: number = 10, offset: number = 0): Promise<ApplicationLog[]> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `
    SELECT id, level, message, updated_at, created_at
    FROM application_logs
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  return dbClient.queryAll<ApplicationLog>(sql, [limit, offset]);
}

export async function getApplicationLogsCount(): Promise<number> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `SELECT COUNT(*) as count FROM application_logs`;
  const result = await dbClient.queryAll<{ count: number }>(sql);
  return result[0]?.count || 0;
}

export async function getApplicationLogsByLevel(level: number, limit: number = 10, offset: number = 0): Promise<ApplicationLog[]> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `
    SELECT id, level, message, updated_at, created_at
    FROM application_logs
    WHERE level = ?
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;
  return dbClient.queryAll<ApplicationLog>(sql, [level, limit, offset]);
}

export async function getApplicationLogsCountByLevel(level: number): Promise<number> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `SELECT COUNT(*) as count FROM application_logs WHERE level = ?`;
  const result = await dbClient.queryAll<{ count: number }>(sql, [level]);
  return result[0]?.count || 0;
}
