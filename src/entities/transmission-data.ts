import { dbClient } from '../database/db';

export type TransmissionData = {
  connection_id: string;
  total_bytes_read_from_downstream: number;
  total_bytes_read_from_upstream: number;
  total_bytes_written_to_downstream: number;
  total_bytes_written_to_upstream: number;
  total_bytes_written_to_secondary_upstreams: number;
  downstream_tls: boolean;
  upstream_tls: boolean;
  updated_at: string;
  created_at: string;
};

export async function getTransmissionForConnection(connectionId: string): Promise<TransmissionData | null> {
  if (!dbClient.isAvailable()) throw new Error('Database not available');
  const sql = `
    SELECT 
      td.connection_id, 
      td.total_bytes_read_from_downstream, 
      td.total_bytes_read_from_upstream, 
      td.total_bytes_written_to_downstream, 
      td.total_bytes_written_to_upstream, 
      td.total_bytes_written_to_secondary_upstreams, 
      c.downstream_tls, 
      c.upstream_tls, 
      td.updated_at, 
      td.created_at 
    FROM relay_connections_transmission_data td
    LEFT JOIN relay_connections c ON td.connection_id = c.id
    WHERE td.connection_id = ? 
    ORDER BY td.created_at DESC 
    LIMIT 1
  `;
  const rows = dbClient.queryAll<TransmissionData>(sql, [connectionId]);
  return rows && rows.length ? rows[0] : null;
}
