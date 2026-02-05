import { formatNumber, formatTs, formatBytes } from '../utils/formatters.js';
import { syntaxHighlightJson } from '../utils/syntaxHighlight.js';

export function renderTransmission(data, connectionId, onRefresh) {
  const detail = document.getElementById('detail');
  
  // Check if transmission section already exists
  let transmissionSection = detail.querySelector('.transmission-section');
  
  if (!transmissionSection) {
    // Create structure once
    detail.innerHTML = '';
    transmissionSection = document.createElement('div');
    transmissionSection.className = 'transmission-section';
    detail.appendChild(transmissionSection);
  }
  
  // Clear only the transmission section content
  transmissionSection.innerHTML = '';

  const headerWrap = document.createElement('div');
  headerWrap.className = 'requests-header';
  const h2 = document.createElement('h2');
  h2.innerHTML = '<i class="fas fa-database"></i> Transmission Data for <span style="text-decoration: underline;">' + connectionId + '</span>';

  const btnWrap = document.createElement('div');
  btnWrap.style.display = 'flex';
  btnWrap.style.gap = '8px';

  const copyBtn = document.createElement('button');
  copyBtn.className = 'icon-btn';
  copyBtn.title = 'Copy to clipboard';
  copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
  copyBtn.addEventListener('click', async () => {
    const out = Object.assign({}, data);
    if (out.created_at) out.created_at = formatTs(out.created_at);
    if (out.updated_at) out.updated_at = formatTs(out.updated_at);
    const jsonStr = JSON.stringify(out, null, 2);
    try {
      await navigator.clipboard.writeText(jsonStr);
      copyBtn.title = 'Copied!';
      setTimeout(() => { copyBtn.title = 'Copy to clipboard'; }, 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  });

  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'icon-btn';
  refreshBtn.title = 'Refresh transmission data';
  refreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
    try {
      await onRefresh(connectionId);
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
    }
  });

  btnWrap.appendChild(copyBtn);
  btnWrap.appendChild(refreshBtn);
  headerWrap.appendChild(h2);
  headerWrap.appendChild(btnWrap);
  transmissionSection.appendChild(headerWrap);

  // Flow chart
  const out = Object.assign({}, data);
  const dsRead = out.total_bytes_read_from_downstream || 0;
  const dsWritten = out.total_bytes_written_to_downstream || 0;
  const usRead = out.total_bytes_read_from_upstream || 0;
  const usWritten = out.total_bytes_written_to_upstream || 0;

  const flow = document.createElement('div');
  flow.className = 'flow-chart';

  const node = (title, values) => {
    const n = document.createElement('div');
    n.className = 'flow-node';
    const t = document.createElement('div');
    t.className = 'flow-node-title';
    t.innerHTML = title;
    const v = document.createElement('div');
    v.className = 'flow-node-values';
    for (const vv of values) {
      const r = document.createElement('div');
      r.className = 'flow-node-value';
      r.innerHTML = vv;
      v.appendChild(r);
    }
    n.appendChild(t);
    n.appendChild(v);
    return n;
  };

  const left = node('<img src="img/downstream.png" class="flow-node-img" alt="Downstream"><div class="flow-node-sub">Downstream</div>', []);
  const mid = node('<img src="img/relay.png" class="flow-node-img" alt="Relay"><div class="flow-node-sub">Relay</div>', [`ID: ${connectionId}`]);
  const right = node('<img src="img/upstream.png" class="flow-node-img" alt="Upstream"><div class="flow-node-sub">Upstream</div>', []);

  const lineGroup = (tx, rx, txArrow, rxArrow, hasTls) => {
    const grp = document.createElement('div');
    grp.className = 'flow-line-group';
    const tlsClass = hasTls ? 'tls' : 'no-tls';
    const txLine = document.createElement('div');
    txLine.className = `flow-line-single ${tlsClass}`;
    txLine.innerHTML = `<span class="line-label"><i class="fas fa-arrow-${txArrow}"></i> TX ${formatBytes(tx)}</span>`;
    const rxLine = document.createElement('div');
    rxLine.className = `flow-line-single ${tlsClass}`;
    rxLine.innerHTML = `<span class="line-label"><i class="fas fa-arrow-${rxArrow}"></i> RX ${formatBytes(rx)}</span>`;
    grp.appendChild(txLine);
    grp.appendChild(rxLine);
    return grp;
  };

  flow.appendChild(left);
  flow.appendChild(lineGroup(dsWritten, dsRead, 'left', 'right', out.downstream_tls));
  flow.appendChild(mid);
  flow.appendChild(lineGroup(usWritten, usRead, 'right', 'left', out.upstream_tls));
  flow.appendChild(right);

  transmissionSection.appendChild(flow);

  // Secondary upstreams visual
  const secondaryBytes = out.total_bytes_written_to_secondary_upstreams || 0;
  const secondaryFlow = document.createElement('div');
  secondaryFlow.className = 'secondary-flow';

  const relayConnector = document.createElement('div');
  relayConnector.className = 'secondary-relay-connector';

  const verticalLine = document.createElement('div');
  verticalLine.className = 'secondary-vertical-line';

  const horizontalBranch = document.createElement('div');
  horizontalBranch.className = 'secondary-horizontal-branch';

  const secondaryNode = document.createElement('div');
  secondaryNode.className = 'flow-node secondary-node';
  secondaryNode.innerHTML = `
    <div class="flow-node-title">
      <img src="img/upstream.png" class="flow-node-img" alt="Secondary Upstreams">
      <div class="flow-node-sub">Secondary Upstreams</div>
    </div>
  `;

  horizontalBranch.appendChild(document.createTextNode(''));
  const label = document.createElement('span');
  label.className = 'line-label';
  label.innerHTML = `<i class="fas fa-arrow-right"></i> TX ${formatBytes(secondaryBytes)}`;
  horizontalBranch.appendChild(label);

  relayConnector.appendChild(verticalLine);
  secondaryFlow.appendChild(relayConnector);
  secondaryFlow.appendChild(horizontalBranch);
  secondaryFlow.appendChild(secondaryNode);

  transmissionSection.appendChild(secondaryFlow);

  // Chart legend
  const legend = document.createElement('div');
  legend.className = 'chart-legend';
  legend.innerHTML = `
    <div class="legend-title"><strong>Chart Legend</strong></div>
    <div class="legend-items">
      <div class="legend-item">
        <span class="legend-symbol">TX</span>
        <span class="legend-label">Transmitted</span>
      </div>
      <div class="legend-item">
        <span class="legend-symbol">RX</span>
        <span class="legend-label">Received</span>
      </div>
      <div class="legend-item">
        <span class="legend-line tls"></span>
        <span class="legend-label">TLS Connection</span>
      </div>
      <div class="legend-item">
        <span class="legend-line no-tls"></span>
        <span class="legend-label">TCP Only</span>
      </div>
    </div>
  `;
  transmissionSection.appendChild(legend);

  // Stat cards
  const stats = [
    { key: 'total_bytes_read_from_downstream', label: 'Bytes read (downstream)', icon: 'fas fa-download' },
    { key: 'total_bytes_written_to_upstream', label: 'Bytes written (upstream)', icon: 'fas fa-upload' },
    { key: 'total_bytes_written_to_secondary_upstreams', label: 'Bytes to secondary', icon: 'fas fa-code-branch' },
    { key: 'total_bytes_read_from_upstream', label: 'Bytes read (upstream)', icon: 'fas fa-download' },
    { key: 'total_bytes_written_to_downstream', label: 'Bytes written (downstream)', icon: 'fas fa-upload' }
  ];

  const grid = document.createElement('div');
  grid.className = 'stat-grid';

  for (const s of stats) {
    const card = document.createElement('div');
    card.className = 'stat-card';
    const lab = document.createElement('div');
    lab.className = 'stat-label';
    lab.innerHTML = `<i class="${s.icon}"></i> ${s.label}`;
    const val = document.createElement('div');
    val.className = 'stat-value';
    const v = out[s.key] != null ? out[s.key] : 0;
    val.textContent = formatNumber(v);
    card.appendChild(lab);
    card.appendChild(val);
    grid.appendChild(card);
  }
  transmissionSection.appendChild(grid);

  // Timestamps
  const times = document.createElement('div');
  times.className = 'stat-times';
  const created = document.createElement('div');
  created.className = 'time-item';
  created.innerHTML = `<strong>Created:</strong> ${out.created_at ? formatTs(out.created_at) : '—'}`;
  const updated = document.createElement('div');
  updated.className = 'time-item';
  updated.innerHTML = `<strong>Updated:</strong> ${out.updated_at ? formatTs(out.updated_at) : '—'}`;
  times.appendChild(created);
  times.appendChild(updated);
  transmissionSection.appendChild(times);
  
}
