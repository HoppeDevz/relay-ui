import { fetchRelayStatus, fetchRelayConfig } from '../api/relay.js';
import { showEndpointModal } from './Modal.js';
import { setRelayRunning } from '../utils/state.js';

export async function renderRelayInfo() {
  const statusEl = document.getElementById('header-relay-status');
  const cfgEl = document.getElementById('relay-config');
  if (statusEl) statusEl.textContent = 'Loading relay status...';
  if (cfgEl) cfgEl.textContent = '';

  // Fetch status
  try {
    const data = await fetchRelayStatus();
    
    // Update global state with relay running status
    setRelayRunning(data.running || false);
    
    if (statusEl) {
      statusEl.innerHTML = '';
      
      // OS info
      if (data.os) {
        const osLabel = document.createElement('span');
        osLabel.style.marginRight = '20px';
        osLabel.innerHTML = `<strong>OS:</strong> ${data.os}`;
        statusEl.appendChild(osLabel);
      }
      
      // Process status
      const processLabel = document.createElement('span');
      processLabel.style.marginRight = '20px';
      const dot = document.createElement('span');
      dot.className = `status-dot ${data.running ? 'status-running' : 'status-stopped'}`;
      processLabel.appendChild(dot);
      const txt = document.createElement('span');
      txt.style.marginLeft = '8px';
      txt.innerHTML = `<strong>Relay Process:</strong> ${data.running ? 'Running' : 'Not Running'}`;
      processLabel.appendChild(txt);
      statusEl.appendChild(processLabel);

      const btn = document.createElement('button');
      btn.id = 'relay-refresh-btn';
      btn.className = 'refresh-btn';
      btn.style.marginLeft = '12px';
      btn.textContent = 'Refresh';
      btn.addEventListener('click', async () => {
        try {
          btn.disabled = true;
          await renderRelayInfo();
        } finally {
          btn.disabled = false;
        }
      });
      statusEl.appendChild(btn);
    }

    if (cfgEl && data.matches && data.matches.length) {
      const pre = document.createElement('pre');
      pre.textContent = data.matches.join('\n');
      cfgEl.appendChild(pre);
    }
  } catch (err) {
    if (statusEl) statusEl.textContent = 'Failed to load relay status: ' + err.message;
  }

  // Fetch config and normalize shape
  try {
    const cfg = await fetchRelayConfig();
    let relays = [];
    if (Array.isArray(cfg)) relays = cfg;
    else if (cfg && Array.isArray(cfg.relays)) relays = cfg.relays;
    else if (cfg && Array.isArray(cfg.servers)) relays = cfg.servers;

    if (relays.length) {
      const table = document.createElement('table');
      table.className = 'relay-table';
      const thead = document.createElement('thead');
      thead.innerHTML = '<tr><th>Port</th><th>Protocol</th><th>TLS</th><th>Primary Endpoint</th><th>Secondary Endpoint</th></tr>';
      table.appendChild(thead);
      const tbody = document.createElement('tbody');
      relays.forEach((relay) => {
        const tr = document.createElement('tr');
        const portTd = document.createElement('td');
        portTd.textContent = String(relay.local_port || relay.port || '');
        const protoTd = document.createElement('td');
        protoTd.textContent = relay.app_layer_protocol || relay.protocol || '';

        const tlsTd = document.createElement('td');
        const tlsBadge = document.createElement('span');
        tlsBadge.className = relay.tls ? 'tls-badge tls-enabled' : 'tls-badge tls-disabled';
        tlsBadge.textContent = relay.tls ? 'Enabled' : 'Disabled';
        tlsTd.appendChild(tlsBadge);

        const makeEndpointCell = (ep, label) => {
          const td = document.createElement('td');
          if (!ep) { td.textContent = ''; return td; }
          const btn = document.createElement('button');
          btn.className = 'endpoint-view-btn';
          btn.textContent = 'View';
          btn.title = label + ' — click to view details';
          btn.addEventListener('click', (e) => { e.preventDefault(); showEndpointModal(ep, label); });
          td.appendChild(btn);
          return td;
        };

        const primTd = makeEndpointCell(relay.primary_endpoint || relay.primary || relay.primaryEndpoint, 'Primary endpoint');
        const secTd = makeEndpointCell(relay.secondary_endpoint || relay.secondary || relay.secondaryEndpoint, 'Secondary endpoint');

        tr.appendChild(portTd);
        tr.appendChild(protoTd);
        tr.appendChild(tlsTd);
        tr.appendChild(primTd);
        tr.appendChild(secTd);
        tbody.appendChild(tr);
      });
      table.appendChild(tbody);
      cfgEl.appendChild(table);
    } else {
      const p = document.createElement('p');
      p.textContent = 'No relays configured.';
      cfgEl.appendChild(p);
    }
  } catch (err) {
    // Silently ignore config errors
  }
}
