// HTTP Requests API

export async function fetchHttpRequests(connectionId, statusFilter = 'all') {
  const params = new URLSearchParams();
  if (statusFilter && statusFilter !== 'all') {
    params.set('status', statusFilter);
  }
  const url = `/connections/${encodeURIComponent(connectionId)}/requests${params.toString() ? '?' + params.toString() : ''}`;
  const res = await fetch(url);
  if (res.status === 404) {
    return [];
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchErrorRequestsCount() {
  const res = await fetch('/requests/errors');
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
