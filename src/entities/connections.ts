import { dbClient } from '../database/db';

export type Connection = {
  id: string;
  downstream_remote_address: string;
  upstream_remote_address: string;
  upstream_resolved_remote_address: string;
  downstream_machine_id?: string;
  downstream_agent_version?: string;
  is_active?: boolean;
  updated_at: string;
  created_at: string;
};

export type ConnectionWithFlags = Connection & { is_macos_agent: boolean };

export async function getConnections(): Promise<Connection[]> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `SELECT id, downstream_remote_address, upstream_remote_address, upstream_resolved_remote_address, downstream_machine_id, downstream_agent_version, updated_at, created_at FROM relay_connections`;
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
      c.downstream_machine_id,
      c.downstream_agent_version,
      c.updated_at,
      c.created_at,
      s.is_active,
      CASE 
        WHEN c.downstream_machine_id IS NOT NULL AND LENGTH(c.downstream_machine_id) >= 22 THEN
          CASE SUBSTR(c.downstream_machine_id, 21, 1)
            WHEN '1' THEN 'Windows'
            WHEN '2' THEN 'Windows'
            WHEN '3' THEN 'AIX'
            WHEN '4' THEN 'Solaris'
            WHEN '5' THEN 'Linux'
            WHEN '6' THEN 'HP-UX'
            WHEN '7' THEN 'Tru64'
            WHEN '8' THEN 'BSD'
            WHEN '9' THEN 'macOS'
            ELSE 'Unknown'
          END
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
    downstream_machine_id: r.downstream_machine_id,
    downstream_agent_version: r.downstream_agent_version,
    is_active: r.is_active === 1,
    updated_at: r.updated_at,
    created_at: r.created_at,
    agent: r.agent || 'Unknown'
  }));
}
