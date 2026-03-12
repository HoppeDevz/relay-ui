// Formatting Utilities

export function formatTs(ts) {
  if (ts == null || ts === '') return '';
  // handle numeric seconds or string numbers
  const n = typeof ts === 'number' ? ts : Number(ts);
  if (Number.isNaN(n)) return String(ts);
  // if it's already milliseconds (large), try to detect: assume seconds if < 1e12
  const ms = n > 1e12 ? n : n * 1000;
  try {
    return new Date(ms).toLocaleString();
  } catch (_) {
    return String(ts);
  }
}

export function formatTime(ts) {
  if (ts == null || ts === '') return '';
  const n = typeof ts === 'number' ? ts : Number(ts);
  if (Number.isNaN(n)) return String(ts);
  const ms = n > 1e12 ? n : n * 1000;
  try {
    const date = new Date(ms);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (_) {
    return String(ts);
  }
}

export function formatNumber(n) {
  if (n == null) return '0';
  try {
    return Number(n).toLocaleString();
  } catch (_) { 
    return String(n); 
  }
}

export function formatBytes(n) {
  if (n == null) return '0';
  try {
    const num = Number(n);
    if (num === 0) return '0';
    
    // Format as bytes with units
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let value = num;
    let unitIndex = 0;
    
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex++;
    }
    
    // Format with appropriate decimal places
    if (value >= 100) {
      return `${Math.round(value).toLocaleString()} ${units[unitIndex]}`;
    } else if (value >= 10) {
      return `${value.toFixed(1)} ${units[unitIndex]}`;
    } else {
      return `${value.toFixed(2)} ${units[unitIndex]}`;
    }
  } catch (_) { 
    return String(n); 
  }
}

export function formatEndpointShort(endpoint) {
  if (!endpoint) return '';
  try {
    const obj = typeof endpoint === 'string' ? JSON.parse(endpoint) : endpoint;
    if (obj.remote_address && obj.remote_port) {
      return `${obj.remote_address}:${obj.remote_port}`;
    }
    if (obj.remote_address) return obj.remote_address;
    if (obj.remote_port) return `:${obj.remote_port}`;
    return JSON.stringify(obj);
  } catch (_) {
    return String(endpoint);
  }
}

export function getOSIcon(agent) {
  const osMap = {
    'macOS': '<i class="fab fa-apple"></i>',
    'Windows': '<i class="fab fa-windows"></i>',
    'Linux': '<i class="fab fa-linux"></i>',
    'Solaris': '<i class="fas fa-sun"></i>',
    'AIX': '<i class="fas fa-server"></i>',
    'HP-UX': '<i class="fas fa-server"></i>',
    'BSD': '<i class="fab fa-freebsd"></i>',
    'Tru64': '<i class="fas fa-server"></i>',
    'Unknown': '<i class="fas fa-question-circle"></i>'
  };
  return osMap[agent] || osMap['Unknown'];
}
