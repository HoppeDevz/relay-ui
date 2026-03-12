// Application State Management
export const state = {
  allConnections: [],
  currentPage: 1,
  pageSize: 10,
  agentFilter: 'All',
  searchQuery: '',
  selectedConnectionId: null,
  httpRequestsPage: 1,
  httpRequestsPageSize: 10,
  httpStatusFilter: 'all',
  relayRunning: false,
  onConnectionClick: null,
  logsPage: 1,
  logsPageSize: 10,
  logsLevelFilter: 'all'
};

export function setConnections(connections) {
  state.allConnections = connections;
}

export function setCurrentPage(page) {
  state.currentPage = page;
}

export function setAgentFilter(filter) {
  state.agentFilter = filter;
}

export function setSearch(search) {
  state.searchQuery = search;
}

export function setSelectedConnection(id) {
  state.selectedConnectionId = id;
  // Reset HTTP requests page when switching connections
  state.httpRequestsPage = 1;
}

export function setHttpRequestsPage(page) {
  state.httpRequestsPage = page;
}

export function setLogsPage(page) {
  state.logsPage = page;
}

export function setLogsLevelFilter(level) {
  state.logsLevelFilter = level;
}

export function setRelayRunning(running) {
  state.relayRunning = running;
}