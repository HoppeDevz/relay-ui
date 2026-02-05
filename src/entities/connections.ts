import { dbClient } from '../database/db';

export type Connection = {
  id: string;
  downstream_remote_address: string;
  upstream_remote_address: string;
  upstream_resolved_remote_address: string;
  is_active?: boolean;
  updated_at: string;
  created_at: string;
};

export type ConnectionWithFlags = Connection & { is_macos_agent: boolean };

export async function getConnections(): Promise<Connection[]> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `SELECT id, downstream_remote_address, upstream_remote_address, upstream_resolved_remote_address, updated_at, created_at FROM relay_connections`;
  return dbClient.queryAll<Connection>(sql);
}

export async function getConnectionsWithAgentFlag(): Promise<(Connection & { agent: string })[]> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `
    SELECT
      c.id,
      c.downstream_remote_address,
      c.upstream_remote_address,
      c.upstream_resolved_remote_address,
      c.updated_at,
      c.created_at,
      s.is_active,
      CASE
        WHEN EXISTS(
          SELECT 1 FROM relay_connections_http_requests r
          WHERE r.connection_id = c.id AND lower(r.route) LIKE '%macos%'
        ) THEN 'macOS'
        WHEN EXISTS(
          SELECT 1 FROM relay_connections_http_requests r
          WHERE r.connection_id = c.id AND lower(r.route) LIKE '%windows%'
        ) THEN 'Windows'
        WHEN EXISTS(
          SELECT 1 FROM relay_connections_http_requests r
          WHERE r.connection_id = c.id AND lower(r.route) LIKE '%linux%'
        ) THEN 'Linux'
        WHEN EXISTS(
          SELECT 1 FROM relay_connections_http_requests r
          WHERE r.connection_id = c.id AND lower(r.route) LIKE '%solaris%'
        ) THEN 'Solaris'
        ELSE 'Unknown'
      END AS agent
    FROM relay_connections c
    LEFT JOIN relay_connections_status s ON c.id = s.connection_id
    ORDER BY c.created_at DESC
  `;
  const rows = dbClient.queryAll<any>(sql);
  return rows.map((r: any) => ({
    id: r.id,
    downstream_remote_address: r.downstream_remote_address,
    upstream_remote_address: r.upstream_remote_address,
    upstream_resolved_remote_address: r.upstream_resolved_remote_address,
    is_active: r.is_active === 1,
    updated_at: r.updated_at,
    created_at: r.created_at,
    agent: r.agent || 'Unknown'
  }));
}
