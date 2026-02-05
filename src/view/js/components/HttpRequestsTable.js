import { formatTs, formatTime } from '../utils/formatters.js';
import { state, setHttpRequestsPage } from '../utils/state.js';

export function appendHttpRequests(connectionId, rows, onRefresh, onShowHeaders) {
  const detail = document.getElementById('detail');

  // Check if HTTP requests section already exists
  let httpSection = detail.querySelector('.http-requests-section');
  
  if (!httpSection) {
    // Create separator
    const separator = document.createElement('div');
    separator.style.marginTop = '24px';
    separator.style.paddingTop = '24px';
    separator.style.borderTop = '2px solid #e2e8f0';
    detail.appendChild(separator);
    
    // Create section
    httpSection = document.createElement('div');
    httpSection.className = 'http-requests-section';
    detail.appendChild(httpSection);
  }
  
  // Clear only the HTTP section content
  httpSection.innerHTML = '';

  const headerWrap = document.createElement('div');
  headerWrap.className = 'requests-header';
  const h2 = document.createElement('h2');
  h2.innerHTML = '<i class="fas fa-network-wired"></i> HTTP Requests on <span style="text-decoration: underline;">' + connectionId + '</span>';

  const btnWrap = document.createElement('div');
  btnWrap.style.display = 'flex';
  btnWrap.style.gap = '8px';
  btnWrap.style.alignItems = 'center';

  // Status filter dropdown
  const filterSelect = document.createElement('select');
  filterSelect.id = 'status-filter';
  filterSelect.style.padding = '6px 12px';
  filterSelect.style.borderRadius = '6px';
  filterSelect.style.border = '1px solid #cbd5e1';
  filterSelect.style.fontSize = '14px';
  filterSelect.style.cursor = 'pointer';
  filterSelect.innerHTML = `
    <option value="all">All</option>
    <option value="2xx">2xx</option>
    <option value="4xx">4xx</option>
    <option value="5xx">5xx</option>
  `;
  
  // Get saved filter or default to 'all'
  const savedFilter = state.httpStatusFilter || 'all';
  filterSelect.value = savedFilter;
  
  filterSelect.addEventListener('change', async () => {
    state.httpStatusFilter = filterSelect.value;
    setHttpRequestsPage(1); // Reset to first page
    // Fetch new data with filter
    await onRefresh(connectionId);
  });

  const copyBtn = document.createElement('button');
  copyBtn.className = 'icon-btn';
  copyBtn.title = 'Copy to clipboard';
  copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
  copyBtn.addEventListener('click', async () => {
    if (!rows || rows.length === 0) return;
    const jsonStr = JSON.stringify(rows, null, 2);
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
  refreshBtn.title = 'Refresh HTTP requests';
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

  btnWrap.appendChild(filterSelect);
  btnWrap.appendChild(copyBtn);
  btnWrap.appendChild(refreshBtn);
  headerWrap.appendChild(h2);
  headerWrap.appendChild(btnWrap);
  httpSection.appendChild(headerWrap);

  // Wrapper div with min-height (create it regardless of whether there are results)
  const tableWrapper = document.createElement('div');
  tableWrapper.style.minHeight = '500px';
  tableWrapper.style.position = 'relative';
  httpSection.appendChild(tableWrapper);

  if (!rows || rows.length === 0) {
    const p = document.createElement('p');
    const statusFilter = state.httpStatusFilter || 'all';
    p.textContent = statusFilter === 'all' ? 'No HTTP requests found.' : `No HTTP requests with status ${statusFilter} found.`;
    p.style.color = '#64748b';
    p.style.fontStyle = 'italic';
    p.style.textAlign = 'center';
    p.style.paddingTop = '200px';
    tableWrapper.appendChild(p);
    return;
  }

  // Pagination
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / state.httpRequestsPageSize));
  if (state.httpRequestsPage > totalPages) {
    setHttpRequestsPage(totalPages);
  }
  const start = (state.httpRequestsPage - 1) * state.httpRequestsPageSize;
  const pageItems = rows.slice(start, start + state.httpRequestsPageSize);

  const table = document.createElement('table');
  table.className = 'requests-table';
  const thead = document.createElement('thead');
  thead.innerHTML = '<tr><th>Method</th><th>Route</th><th>Request Headers</th><th>Response Headers</th><th>Sent At</th><th>Replied At</th><th>Status</th><th>Duration</th></tr>';
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  for (const r of pageItems) {
    const tr = document.createElement('tr');
    const m = document.createElement('td');
    const methodBadge = document.createElement('span');
    const methodText = (r.method || 'UNKNOWN').toString().toUpperCase();
    methodBadge.className = `method-badge method-${methodText}`;
    methodBadge.textContent = methodText;
    m.appendChild(methodBadge);
    const route = document.createElement('td');
    route.textContent = r.route || '';
    
    // Status column
    const status = document.createElement('td');
    if (r.response_status) {
      const statusBadge = document.createElement('span');
      statusBadge.className = 'status-badge';
      const statusCode = parseInt(r.response_status);
      if (statusCode >= 200 && statusCode < 300) {
        statusBadge.classList.add('status-success');
      } else if (statusCode >= 300 && statusCode < 400) {
        statusBadge.classList.add('status-redirect');
      } else if (statusCode >= 400 && statusCode < 500) {
        statusBadge.classList.add('status-client-error');
      } else if (statusCode >= 500) {
        statusBadge.classList.add('status-server-error');
      }
      statusBadge.textContent = r.response_status;
      status.appendChild(statusBadge);
    } else {
      status.textContent = '—';
      status.style.color = '#94a3b8';
    }
    
    // Duration column
    const duration = document.createElement('td');
    if (r.sent_at && r.replied_at) {
      const sentTime = new Date(r.sent_at).getTime();
      const repliedTime = new Date(r.replied_at).getTime();
      const durationMs = repliedTime - sentTime;
      
      if (durationMs >= 1000) {
        // Show in seconds if >= 1s
        const durationS = (durationMs / 1000).toFixed(2);
        duration.textContent = `${durationS} s`;
      } else {
        // Show in milliseconds
        duration.textContent = `${durationMs} ms`;
      }
      
      // Color code based on duration
      if (durationMs < 100) {
        duration.style.color = '#34A853'; // Green - fast
      } else if (durationMs < 500) {
        duration.style.color = '#FBBC04'; // Yellow - moderate
      } else {
        duration.style.color = '#EA4335'; // Red - slow
      }
      duration.style.fontWeight = '600';
    } else {
      duration.textContent = '—';
      duration.style.color = '#94a3b8';
    }
    
    // Request headers column
    const headers = document.createElement('td');
    const viewBtn = document.createElement('button');
    viewBtn.className = 'view-headers-btn';
    viewBtn.textContent = 'View';
    viewBtn.addEventListener('click', (ev) => {
      ev.preventDefault();
      onShowHeaders(r.headers, r.forwarded_headers);
    });
    headers.appendChild(viewBtn);
    
    // Response headers column
    const responseHeaders = document.createElement('td');
    if (r.response_headers) {
      const viewRespBtn = document.createElement('button');
      viewRespBtn.className = 'view-headers-btn';
      viewRespBtn.textContent = 'View';
      viewRespBtn.addEventListener('click', (ev) => {
        ev.preventDefault();
        onShowHeaders(r.response_headers, r.response_forwarded_headers, 'Response Headers');
      });
      responseHeaders.appendChild(viewRespBtn);
    } else {
      responseHeaders.textContent = '—';
      responseHeaders.style.color = '#94a3b8';
    }
    
    // Sent At column
    const sentAt = document.createElement('td');
    sentAt.textContent = formatTime(r.sent_at) || '';
    
    // Replied At column
    const repliedAt = document.createElement('td');
    if (r.replied_at) {
      repliedAt.textContent = formatTime(r.replied_at);
    } else {
      repliedAt.textContent = '—';
      repliedAt.style.color = '#94a3b8';
    }
    
    tr.appendChild(m);
    tr.appendChild(route);
    tr.appendChild(headers);
    tr.appendChild(responseHeaders);
    tr.appendChild(sentAt);
    tr.appendChild(repliedAt);
    tr.appendChild(status);
    tr.appendChild(duration);
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  tableWrapper.appendChild(table);
  httpSection.appendChild(tableWrapper);

  // Pagination controls
  if (totalPages > 1) {
    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination';
    paginationDiv.style.marginTop = '16px';

    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.disabled = state.httpRequestsPage === 1;
    prevBtn.addEventListener('click', () => {
      if (state.httpRequestsPage > 1) {
        setHttpRequestsPage(state.httpRequestsPage - 1);
        onRefresh(connectionId);
      }
    });

    const pageInfo = document.createElement('span');
    pageInfo.textContent = `Page ${state.httpRequestsPage} of ${totalPages}`;

    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.disabled = state.httpRequestsPage === totalPages;
    nextBtn.addEventListener('click', () => {
      if (state.httpRequestsPage < totalPages) {
        setHttpRequestsPage(state.httpRequestsPage + 1);
        onRefresh(connectionId);
      }
    });

    paginationDiv.appendChild(prevBtn);
    paginationDiv.appendChild(pageInfo);
    paginationDiv.appendChild(nextBtn);
    httpSection.appendChild(paginationDiv);
  }
}
