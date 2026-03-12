// Connections Table Component
import { state, setCurrentPage, setSelectedConnection } from '../utils/state.js';
import { formatTs, getOSIcon } from '../utils/formatters.js';

export function renderConnectionsPage(onConnectionClick) {
  // Store callback in state for pagination use
  if (onConnectionClick) {
    state.onConnectionClick = onConnectionClick;
  }
  
  const tbody = document.querySelector('#connections-table tbody');
  tbody.innerHTML = '';
  
  // Apply search + filter
  const filtered = state.allConnections.filter((r) => {
    if (state.agentFilter && state.agentFilter !== 'All') {
      if (!r.agent || r.agent !== state.agentFilter) return false;
    }
    if (state.searchQuery) {
      const hay = `${r.upstream_remote_address || ''} ${r.downstream_remote_address || ''} ${r.downstream_machine_id || ''} ${r.downstream_agent_version || ''}`.toLowerCase();
      if (!hay.includes(state.searchQuery)) return false;
    }
    return true;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / state.pageSize));
  if (state.currentPage > totalPages) {
    setCurrentPage(totalPages);
  }
  const start = (state.currentPage - 1) * state.pageSize;
  const pageItems = filtered.slice(start, start + state.pageSize);

  if (!pageItems || pageItems.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = 9;
    td.textContent = 'No connections found.';
    tr.appendChild(td);
    tbody.appendChild(tr);
  }

  for (const r of pageItems) {
    const tr = document.createElement('tr');
    tr.style.cursor = 'pointer';
    if (r.id === state.selectedConnectionId) {
      tr.classList.add('selected-row');
    }
    tr.addEventListener('click', () => {
      setSelectedConnection(r.id);
      // Remove selected class from all rows
      document.querySelectorAll('#connections-table tbody tr').forEach(row => row.classList.remove('selected-row'));
      // Add selected class to clicked row
      tr.classList.add('selected-row');
      if (state.onConnectionClick) {
        state.onConnectionClick(r.id);
      }
    });
    
    // Status indicator
    const statusTd = document.createElement('td');
    statusTd.style.textAlign = 'center';
    const statusDot = document.createElement('span');
    statusDot.className = 'status-dot';
    
    // Connection is alive = relay is running AND is_active = true
    const isAlive = state.relayRunning && r.is_active === true;
    
    if (isAlive) {
      statusDot.classList.add('status-active');
      statusDot.title = 'Connection Alive';
    } else {
      statusDot.classList.add('status-inactive');
      statusDot.title = 'Connection Inactive';
    }
    statusTd.appendChild(statusDot);
    tr.appendChild(statusTd);

    const ds = document.createElement('td'); 
    ds.textContent = r.downstream_remote_address || '';
    const us = document.createElement('td'); 
    us.textContent = r.upstream_remote_address || '';
    const res = document.createElement('td'); 
    res.textContent = r.upstream_resolved_remote_address || '';
    
    const machineId = document.createElement('td');
    machineId.textContent = r.downstream_machine_id || '—';
    machineId.style.fontFamily = 'monospace';
    machineId.style.fontSize = '0.9em';
    
    const agentVersion = document.createElement('td');
    agentVersion.textContent = r.downstream_agent_version || '—';
    agentVersion.style.fontFamily = 'monospace';
    agentVersion.style.fontSize = '0.9em';
    
    const osTd = document.createElement('td');
    osTd.className = 'os-column';
    if (r.agent) {
      const osIcon = document.createElement('span');
      osIcon.className = `os-icon os-${r.agent.toLowerCase()}`;
      osIcon.title = r.agent;
      osIcon.innerHTML = getOSIcon(r.agent);
      osTd.appendChild(osIcon);
    } else {
      osTd.textContent = '—';
    }
    
    const created = document.createElement('td'); 
    created.textContent = formatTs(r.created_at) || '';

    tr.appendChild(ds);
    tr.appendChild(us);
    tr.appendChild(res);
    tr.appendChild(machineId);
    tr.appendChild(agentVersion);
    tr.appendChild(osTd);
    tr.appendChild(created);
    tbody.appendChild(tr);
  }

  renderPagination(totalPages, state.currentPage);
}

export function renderPagination(totalPages, current) {
  const pager = document.getElementById('pagination');
  if (!pager) return;
  pager.innerHTML = '';
  
  const prev = document.createElement('button');
  prev.textContent = 'Previous';
  prev.disabled = current <= 1;
  prev.style.padding = '8px 16px';
  prev.style.fontSize = '14px';
  prev.style.borderRadius = '6px';
  prev.style.border = '1px solid #cbd5e1';
  prev.style.background = current <= 1 ? '#f1f5f9' : '#fff';
  prev.style.color = current <= 1 ? '#94a3b8' : '#334155';
  prev.style.cursor = current <= 1 ? 'not-allowed' : 'pointer';
  prev.addEventListener('click', () => { 
    if (current > 1) { 
      setCurrentPage(state.currentPage - 1); 
      renderConnectionsPage(state.onConnectionClick); 
    } 
  });
  pager.appendChild(prev);

  const span = document.createElement('span');
  span.textContent = `Page ${current} of ${totalPages}`;
  span.style.fontSize = '14px';
  span.style.color = '#64748b';
  span.style.fontWeight = '500';
  pager.appendChild(span);

  const next = document.createElement('button');
  next.textContent = 'Next';
  next.disabled = current >= totalPages;
  next.style.padding = '8px 16px';
  next.style.fontSize = '14px';
  next.style.borderRadius = '6px';
  next.style.border = 'none';
  next.style.background = current >= totalPages ? '#cbd5e1' : '#298398';
  next.style.color = '#fff';
  next.style.cursor = current >= totalPages ? 'not-allowed' : 'pointer';
  next.addEventListener('click', () => { 
    if (current < totalPages) { 
      setCurrentPage(state.currentPage + 1); 
      renderConnectionsPage(state.onConnectionClick); 
    } 
  });
  pager.appendChild(next);
}
