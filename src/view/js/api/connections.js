// Connections API

export async function fetchConnections() {
  const res = await fetch('/connections');
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
