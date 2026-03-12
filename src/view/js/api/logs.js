// Application Logs API

export async function fetchLogs(level, page = 1, limit = 10) {
  const params = new URLSearchParams();
  if (level !== undefined && level !== 'all') {
    params.set('level', level.toString());
  }
  params.set('page', page.toString());
  params.set('limit', limit.toString());
  
  const url = `/logs?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
