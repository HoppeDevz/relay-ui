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
      const hay = `${r.id || ''} ${r.upstream_remote_address || ''} ${r.downstream_remote_address || ''}`.toLowerCase();
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
    td.colSpan = 8;
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
    
    const idTd = document.createElement('td');
    idTd.textContent = r.id;
    tr.appendChild(idTd);

    const ds = document.createElement('td'); 
    ds.textContent = r.downstream_remote_address || '';
    const us = document.createElement('td'); 
    us.textContent = r.upstream_remote_address || '';
    const res = document.createElement('td'); 
    res.textContent = r.upstream_resolved_remote_address || '';
    
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
  prev.addEventListener('click', () => { 
    if (current > 1) { 
      setCurrentPage(state.currentPage - 1); 
      renderConnectionsPage(state.onConnectionClick); 
    } 
  });
  pager.appendChild(prev);

  const span = document.createElement('span');
  span.textContent = `Page ${current} of ${totalPages}`;
  pager.appendChild(span);

  const next = document.createElement('button');
  next.textContent = 'Next';
  next.disabled = current >= totalPages;
  next.addEventListener('click', () => { 
    if (current < totalPages) { 
      setCurrentPage(state.currentPage + 1); 
      renderConnectionsPage(state.onConnectionClick); 
    } 
  });
  pager.appendChild(next);
}
