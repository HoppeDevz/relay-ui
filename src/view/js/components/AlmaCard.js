// Alma Card Component - Welcome banner

export function renderAlmaCard() {
  const container = document.getElementById('alma-card');
  if (!container) return;

  container.innerHTML = `
    <div class="alma-character">
      <img src="img/almaden-vector.svg" alt="Almaden logo" style="height: 80px; width: auto;">
    </div>
    <div class="alma-content">
      <h3 class="alma-title">Welcome to Collective IQ® TCP Relay Dashboard</h3>
      <p class="alma-message">Monitor your relay connections, transmission data, and HTTP requests in real-time.</p>
    </div>
  `;
}
