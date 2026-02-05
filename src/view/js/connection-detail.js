import { fetchTransmissionData } from './api/transmission.js';
import { fetchHttpRequests } from './api/requests.js';
import { renderTransmission } from './components/TransmissionFlow.js';
import { appendHttpRequests } from './components/HttpRequestsTable.js';
import { showHeaders } from './components/Modal.js';
import { state } from './utils/state.js';

// Get connection ID from URL
const params = new URLSearchParams(window.location.search);
const connectionId = params.get('id');

if (!connectionId) {
  document.body.innerHTML = '<div class="container"><h2>Error: No connection ID provided</h2><a href="/">Back to Connections</a></div>';
} else {
  loadConnectionDetails();
}

async function loadConnectionDetails() {
  try {
    // Show connection ID with back button
    const infoDiv = document.getElementById('connection-info');
    infoDiv.innerHTML = `
      <div style="margin-bottom: 24px;">
        <button onclick="window.location.href='/'" style="padding: 10px 20px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s; display: inline-flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#2563eb'" onmouseout="this.style.background='#3b82f6'">
          <i class="fas fa-arrow-left"></i>
          <span>Back to Connections</span>
        </button>
      </div>
      <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
        <h3 style="margin: 0; color: #334155;">
          <i class="fas fa-network-wired"></i> Connection ID: <code style="background: #e2e8f0; padding: 4px 8px; border-radius: 4px;">${connectionId}</code>
        </h3>
      </div>
    `;

    // Fetch and render data
    const transmissionData = await fetchTransmissionData(connectionId);
    const httpRequests = await fetchHttpRequests(connectionId, state.httpStatusFilter || 'all');

    renderTransmission(transmissionData, connectionId, handleRefresh);
    appendHttpRequests(connectionId, httpRequests, handleRefresh, showHeaders);
  } catch (err) {
    console.error('Failed to load connection details:', err);
    document.getElementById('detail').innerHTML = `
      <div style="padding: 24px; text-align: center; color: #dc2626;">
        <i class="fas fa-exclamation-triangle" style="font-size: 48px; margin-bottom: 16px;"></i>
        <h3>Failed to load connection details</h3>
        <p>${err.message}</p>
        <a href="/" style="display: inline-block; margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none;">
          Back to Connections
        </a>
      </div>
    `;
  }
}

async function handleRefresh(connectionId) {
  const transmissionData = await fetchTransmissionData(connectionId);
  const httpRequests = await fetchHttpRequests(connectionId, state.httpStatusFilter || 'all');

  renderTransmission(transmissionData, connectionId, handleRefresh);
  appendHttpRequests(connectionId, httpRequests, handleRefresh, showHeaders);
}
