import { dbClient } from '../database/db';

export type HttpRequest = {
  request_id: string;
  connection_id: string;
  method: string;
  route: string;
  headers: string;
  forwarded_headers?: string;
  response_status?: number;
  response_headers?: string;
  response_forwarded_headers?: string;
  sent_at: string;
  replied_at?: string;
  updated_at: string;
  created_at: string;
};

export async function getHttpRequestsForConnection(connectionId: string, statusFilter?: string): Promise<HttpRequest[]> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  
  let statusCondition = '';
  if (statusFilter && statusFilter !== 'all') {
    if (statusFilter === '2xx') {
      statusCondition = ' AND resp.status >= 200 AND resp.status < 300';
    } else if (statusFilter === '4xx') {
      statusCondition = ' AND resp.status >= 400 AND resp.status < 500';
    } else if (statusFilter === '5xx') {
      statusCondition = ' AND resp.status >= 500 AND resp.status < 600';
    }
  }
  
  const sql = `
    SELECT 
      r.request_id,
      r.connection_id, 
      r.method, 
      r.route, 
      r.headers,
      f.forwarded_headers,
      resp.status as response_status,
      resp.headers as response_headers,
      respf.forwarded_headers as response_forwarded_headers,
      r.created_at as sent_at,
      resp.created_at as replied_at,
      r.updated_at, 
      r.created_at 
    FROM relay_connections_http_requests r
    LEFT JOIN http_requests_forwarded_headers f ON r.connection_id = f.connection_id AND r.request_id = f.request_id
    LEFT JOIN relay_connections_http_responses resp ON resp.connection_id = f.connection_id AND resp.request_id = f.request_id
    LEFT JOIN http_responses_forwarded_headers respf ON respf.connection_id = resp.connection_id AND respf.request_id = resp.request_id
    WHERE r.connection_id = ?${statusCondition}
    ORDER BY r.created_at DESC
  `;
  return dbClient.queryAll<HttpRequest>(sql, [connectionId]);
}

export async function getAllHttpRequests(): Promise<HttpRequest[]> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `SELECT connection_id, method, route, headers, updated_at, created_at FROM relay_connections_http_requests ORDER BY created_at DESC`;
  return dbClient.queryAll<HttpRequest>(sql);
}

export async function getErrorRequestsCount(): Promise<{ count: number; connections: string[] }> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `
    SELECT 
      COUNT(DISTINCT r.connection_id) as count,
      GROUP_CONCAT(DISTINCT r.connection_id) as connections
    FROM relay_connections_http_requests r
    LEFT JOIN relay_connections_http_responses resp ON r.request_id = resp.request_id AND r.connection_id = resp.connection_id
    WHERE resp.status >= 400
  `;
  const result = await dbClient.queryAll<{ count: number; connections: string }>(sql);
  if (result && result.length > 0) {
    const connections = result[0].connections ? result[0].connections.split(',') : [];
    return { count: result[0].count || 0, connections };
  }
  return { count: 0, connections: [] };
}
