import { state, setCurrentPage, setSelectedConnection, setAgentFilter } from './utils/state.js';
import { fetchConnections } from './api/connections.js';
import { fetchTransmissionData } from './api/transmission.js';
import { fetchHttpRequests, fetchErrorRequestsCount } from './api/requests.js';
import { renderConnectionsPage, renderPagination } from './components/ConnectionsTable.js';
import { renderTransmission } from './components/TransmissionFlow.js';
import { appendHttpRequests } from './components/HttpRequestsTable.js';
import { showHeaders } from './components/Modal.js';
import { renderRelayInfo } from './components/RelayInfo.js';
import { renderAlmaCard } from './components/AlmaCard.js';

console.log('Main.js module loaded successfully');

// Update error indicator
async function updateErrorIndicator() {
  try {
    const result = await fetchErrorRequestsCount();
    const wrapper = document.getElementById('error-indicator-wrapper');
    const indicator = document.getElementById('error-indicator');
    const characterImg = document.getElementById('error-character-img');
    const title = indicator.querySelector('.error-title');
    const subtitle = indicator.querySelector('.error-subtitle');
    
    if (result.count > 0) {
      // Errors found state
      indicator.classList.remove('no-errors');
      indicator.classList.add('has-errors');
      characterImg.src = 'img/errors-found.png';
      characterImg.alt = 'Errors Found';
      title.textContent = 'HTTP Errors Detected';
      subtitle.innerHTML = `<span id="error-count">${result.count}</span> connection(s) affected`;
      indicator.style.cursor = 'pointer';
      indicator.title = `Connections with errors: ${result.connections.join(', ')}`;
      indicator.onclick = showErrorsView;
    } else {
      // No errors state
      indicator.classList.remove('has-errors');
      indicator.classList.add('no-errors');
      characterImg.src = 'img/any-errors-found.png';
      characterImg.alt = 'No Errors';
      title.textContent = 'All Clear';
      subtitle.textContent = 'No HTTP errors detected';
      indicator.style.cursor = 'default';
      indicator.title = 'No errors detected';
      indicator.onclick = null;
    }
    
    wrapper.style.display = 'block';
  } catch (err) {
    console.error('Failed to fetch error count:', err);
  }
}

// Main fetch and render function for connections
async function loadConnections() {
  const statusEl = document.getElementById('status');
  if (statusEl) statusEl.textContent = 'Loading connections...';
  
  try {
    const rows = await fetchConnections();
    if (!rows) {
      if (statusEl) statusEl.textContent = 'No connections data received.';
      return;
    }

    // Store in state (already sorted by backend)
    state.allConnections = rows;

    renderConnectionsPage((id) => {
      handleConnectionClick(id);
    });

    const totalPages = Math.ceil(state.allConnections.length / state.pageSize);
    renderPagination(totalPages, state.currentPage);
    
    // Auto-select first connection if any exist
    if (rows.length > 0 && !state.selectedConnectionId) {
      handleConnectionClick(rows[0].id);
    }
    
    if (statusEl) statusEl.textContent = '';
  } catch (err) {
    console.error('Failed to load connections:', err);
    if (statusEl) statusEl.textContent = 'Failed to load connections: ' + err.message;
  }
  
  // Update error indicator
  await updateErrorIndicator();
}

// Handle connection row click
async function handleConnectionClick(connectionId) {
  setSelectedConnection(connectionId);
  renderConnectionsPage((id) => handleConnectionClick(id));

  // Fetch transmission and HTTP requests data
  const transmissionData = await fetchTransmissionData(connectionId);
  const httpRequests = await fetchHttpRequests(connectionId, state.httpStatusFilter || 'all');

  // Render transmission flow (it will handle clearing and updating)
  renderTransmission(transmissionData, connectionId, handleRefresh);
  
  // Render HTTP requests table
  appendHttpRequests(connectionId, httpRequests, handleRefresh, showHeaders);
}

// Refresh handler for transmission/requests
async function handleRefresh(connectionId) {
  const transmissionData = await fetchTransmissionData(connectionId);
  const httpRequests = await fetchHttpRequests(connectionId, state.httpStatusFilter || 'all');

  if (transmissionData) {
    renderTransmission(transmissionData, connectionId, handleRefresh);
  }
  if (httpRequests) {
    appendHttpRequests(connectionId, httpRequests, handleRefresh, showHeaders);
  }
}

// Initialize the application
window.addEventListener('DOMContentLoaded', async () => {
  console.log('Application initializing...');
  
  renderAlmaCard();
  
  // Load relay status first to set state.relayRunning
  await renderRelayInfo();
  
  // Then load connections (status dots will be correct)
  await loadConnections();

  // Search handler
  const searchInput = document.getElementById('search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      state.searchQuery = e.target.value.toLowerCase();
      setCurrentPage(1);
      renderConnectionsPage((id) => handleConnectionClick(id));
      const totalPages = Math.ceil(state.allConnections.length / state.pageSize);
      renderPagination(totalPages, state.currentPage);
    });
  }

  // Agent filter handler
  const agentFilter = document.getElementById('agent-filter');
  if (agentFilter) {
    agentFilter.addEventListener('change', (e) => {
      state.agentFilter = e.target.value;
      setCurrentPage(1);
      renderConnectionsPage((id) => handleConnectionClick(id));
      const totalPages = Math.ceil(state.allConnections.length / state.pageSize);
      renderPagination(totalPages, state.currentPage);
    });
  }

  // Refresh button
  const refreshBtn = document.getElementById('refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      refreshBtn.disabled = true;
      refreshBtn.innerHTML = '<i class="fas fa-sync fa-spin"></i>';
      try {
        await loadConnections();
      } finally {
        refreshBtn.disabled = false;
        refreshBtn.innerHTML = '<i class="fas fa-sync"></i>';
      }
    });
  }
  
  // Error indicator click handler
  const errorIndicator = document.getElementById('error-indicator');
  if (errorIndicator) {
    errorIndicator.addEventListener('click', async () => {
      // Show errors modal/view
      await showErrorsView();
    });
  }

});

// Show errors view
async function showErrorsView() {
  try {
    const result = await fetchErrorRequestsCount();
    
    if (result.count === 0) {
      alert('No errors found.');
      return;
    }
    
    // Create modal overlay
    let overlay = document.getElementById('errors-modal-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'errors-modal-overlay';
      overlay.className = 'modal-overlay';
      document.body.appendChild(overlay);
    }
    
    overlay.innerHTML = `
      <div class="modal errors-modal">
        <div class="modal-header">
          <span>HTTP Errors - ${result.count} Connection(s) Affected</span>
          <button class="modal-close" onclick="document.getElementById('errors-modal-overlay').style.display='none'">&times;</button>
        </div>
        <div class="modal-body">
          <div class="errors-list">
            ${result.connections.map(connId => `
              <div class="error-item" onclick="window.location.href='/connection-detail.html?id=${connId}'">
                <i class="fas fa-exclamation-circle"></i>
                <span>Connection: ${connId}</span>
                <i class="fas fa-arrow-right"></i>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
    
    overlay.style.display = 'flex';
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        overlay.style.display = 'none';
      }
    });
  } catch (err) {
    console.error('Failed to show errors:', err);
    alert('Failed to load errors: ' + err.message);
  }
}
