// Relay API

export async function fetchRelayStatus() {
  const res = await fetch('/relay/status');
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}

export async function fetchRelayConfig() {
  const res = await fetch('/relay/config');
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
