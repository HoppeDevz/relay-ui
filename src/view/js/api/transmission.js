// Transmission API

export async function fetchTransmissionData(connectionId) {
  const res = await fetch(`/connections/${encodeURIComponent(connectionId)}/transmission`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return await res.json();
}
