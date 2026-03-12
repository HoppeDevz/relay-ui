import { formatTs } from '../utils/formatters.js';
import { state, setLogsPage } from '../utils/state.js';

const LOG_LEVELS = {
  0: { name: 'INFO', color: '#ffffff', bgColor: '#334155' },
  1: { name: 'WARNING', color: '#fbbf24', bgColor: '#451a03' },
  2: { name: 'ERROR', color: '#ef4444', bgColor: '#450a0a' }
};

export function renderLogsViewer(data, onRefresh, onFilterChange, onPageChange) {
  const container = document.getElementById('logs-section');
  if (!container) return;

  const { logs, total } = data;
  container.innerHTML = '';

  // Header
  const headerWrap = document.createElement('div');
  headerWrap.className = 'requests-header';
  headerWrap.style.marginBottom = '16px';

  const h2 = document.createElement('h2');
  h2.innerHTML = '<i class="fas fa-file-alt"></i> Application Logs';

  const controls = document.createElement('div');
  controls.style.display = 'flex';
  controls.style.gap = '8px';
  controls.style.alignItems = 'center';

  // Level filter
  const levelSelect = document.createElement('select');
  levelSelect.style.padding = '6px 12px';
  levelSelect.style.borderRadius = '6px';
  levelSelect.style.border = '1px solid #cbd5e1';
  levelSelect.style.fontSize = '14px';
  levelSelect.innerHTML = `
    <option value="all">All Levels</option>
    <option value="0">INFO</option>
    <option value="1">WARNING</option>
    <option value="2">ERROR</option>
  `;
  
  // Set the current selected value
  levelSelect.value = state.logsLevelFilter || 'all';
  
  levelSelect.addEventListener('change', () => {
    if (onFilterChange) onFilterChange(levelSelect.value);
  });

  // Refresh button
  const refreshBtn = document.createElement('button');
  refreshBtn.className = 'icon-btn';
  refreshBtn.title = 'Refresh logs';
  refreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
  refreshBtn.addEventListener('click', async () => {
    refreshBtn.disabled = true;
    refreshBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
    try {
      await onRefresh();
    } finally {
      refreshBtn.disabled = false;
      refreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
    }
  });

  controls.appendChild(levelSelect);
  controls.appendChild(refreshBtn);
  headerWrap.appendChild(h2);
  headerWrap.appendChild(controls);
  container.appendChild(headerWrap);

  // Logs container
  const logsContainer = document.createElement('div');
  logsContainer.style.background = '#1e293b';
  logsContainer.style.borderRadius = '8px';
  logsContainer.style.padding = '16px';
  logsContainer.style.maxHeight = '600px';
  logsContainer.style.overflowY = 'auto';
  logsContainer.style.fontFamily = 'monospace';
  logsContainer.style.fontSize = '13px';

  if (!logs || logs.length === 0) {
    const emptyMsg = document.createElement('p');
    emptyMsg.textContent = 'No logs found.';
    emptyMsg.style.color = '#94a3b8';
    emptyMsg.style.fontStyle = 'italic';
    emptyMsg.style.textAlign = 'center';
    logsContainer.appendChild(emptyMsg);
  } else {
    logs.forEach(log => {
      const logEntry = document.createElement('div');
      logEntry.style.display = 'flex';
      logEntry.style.gap = '12px';
      logEntry.style.marginBottom = '8px';
      logEntry.style.padding = '8px';
      logEntry.style.borderRadius = '4px';
      logEntry.style.background = 'rgba(255, 255, 255, 0.05)';
      logEntry.style.borderLeft = `3px solid ${LOG_LEVELS[log.level]?.color || '#94a3b8'}`;

      // Timestamp
      const timestamp = document.createElement('span');
      timestamp.textContent = formatTs(log.created_at);
      timestamp.style.color = '#94a3b8';
      timestamp.style.minWidth = '150px';
      timestamp.style.fontSize = '12px';

      // Level badge
      const levelBadge = document.createElement('span');
      const levelInfo = LOG_LEVELS[log.level] || { name: 'UNKNOWN', color: '#94a3b8', bgColor: '#f1f5f9' };
      levelBadge.textContent = levelInfo.name;
      levelBadge.style.color = levelInfo.color;
      levelBadge.style.background = levelInfo.bgColor;
      levelBadge.style.padding = '2px 8px';
      levelBadge.style.borderRadius = '4px';
      levelBadge.style.fontWeight = '600';
      levelBadge.style.fontSize = '11px';
      levelBadge.style.minWidth = '60px';
      levelBadge.style.textAlign = 'center';

      // Message
      const message = document.createElement('span');
      message.textContent = log.message;
      message.style.color = '#e2e8f0';
      message.style.flex = '1';
      message.style.wordBreak = 'break-word';

      logEntry.appendChild(timestamp);
      logEntry.appendChild(levelBadge);
      logEntry.appendChild(message);
      logsContainer.appendChild(logEntry);
    });
  }

  container.appendChild(logsContainer);

  // Pagination (bottom, centered like connections)
  const totalPages = Math.max(1, Math.ceil(total / state.logsPageSize));
  const paginationBottom = document.createElement('div');
  paginationBottom.style.display = 'flex';
  paginationBottom.style.justifyContent = 'center';
  paginationBottom.style.alignItems = 'center';
  paginationBottom.style.gap = '12px';
  paginationBottom.style.marginTop = '16px';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = state.logsPage <= 1;
  prevBtn.style.padding = '8px 16px';
  prevBtn.style.fontSize = '14px';
  prevBtn.style.borderRadius = '6px';
  prevBtn.style.border = '1px solid #cbd5e1';
  prevBtn.style.background = state.logsPage <= 1 ? '#f1f5f9' : '#fff';
  prevBtn.style.color = state.logsPage <= 1 ? '#94a3b8' : '#334155';
  prevBtn.style.cursor = state.logsPage <= 1 ? 'not-allowed' : 'pointer';
  prevBtn.addEventListener('click', () => {
    if (state.logsPage > 1) {
      setLogsPage(state.logsPage - 1);
      if (onPageChange) onPageChange();
    }
  });

  const pageSpan = document.createElement('span');
  pageSpan.textContent = `Page ${state.logsPage} of ${totalPages}`;
  pageSpan.style.fontSize = '14px';
  pageSpan.style.color = '#64748b';
  pageSpan.style.fontWeight = '500';

  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next';
  nextBtn.disabled = state.logsPage >= totalPages;
  nextBtn.style.padding = '8px 16px';
  nextBtn.style.fontSize = '14px';
  nextBtn.style.borderRadius = '6px';
  nextBtn.style.border = 'none';
  nextBtn.style.background = state.logsPage >= totalPages ? '#cbd5e1' : '#298398';
  nextBtn.style.color = '#fff';
  nextBtn.style.cursor = state.logsPage >= totalPages ? 'not-allowed' : 'pointer';
  nextBtn.addEventListener('click', () => {
    if (state.logsPage < totalPages) {
      setLogsPage(state.logsPage + 1);
      if (onPageChange) onPageChange();
    }
  });

  paginationBottom.appendChild(prevBtn);
  paginationBottom.appendChild(pageSpan);
  paginationBottom.appendChild(nextBtn);
  container.appendChild(paginationBottom);
}
