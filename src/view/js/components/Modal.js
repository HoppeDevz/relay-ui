import { syntaxHighlightJson, syntaxHighlightHttp } from '../utils/syntaxHighlight.js';

export function createModal() {
  let overlay = document.getElementById('headers-modal-overlay');
  if (overlay) {
    overlay.style.display = 'flex';
    overlay.classList.remove('modal-fade-out');
    overlay.classList.add('modal-fade-in');
    return overlay;
  }
  overlay = document.createElement('div');
  overlay.id = 'headers-modal-overlay';
  overlay.className = 'modal-overlay modal-fade-in';
  overlay.innerHTML = `
    <div class="modal">
      <div class="modal-header">
        <span>Headers</span>
        <button class="modal-close" aria-label="Close">×</button>
      </div>
      <div class="modal-body"><pre class="modal-content"></pre></div>
    </div>
  `;
  document.body.appendChild(overlay);
  overlay.querySelector('.modal-close').addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
  return overlay;
}

export function showHeaders(headers, forwardedHeaders, customTitle) {
  const overlay = createModal();
  const pre = overlay.querySelector('.modal-content');
  
  // Update modal title (default to 'Request Headers' if not provided)
  const modalHeader = overlay.querySelector('.modal-header span');
  if (modalHeader) {
    modalHeader.textContent = customTitle || 'Request Headers';
  }
  
  let content = '';
  let isJson = false;
  
  // Original headers
  if (!headers) {
    content = '(no headers)';
  } else {
    try {
      const obj = JSON.parse(headers);
      content = JSON.stringify(obj, null, 2);
      isJson = true;
    } catch (_) {
      if (typeof headers === 'string' && (headers.includes('\n') || headers.includes(':'))) {
        content = headers;
      } else {
        content = String(headers);
      }
    }
  }
  
  if (isJson) {
    pre.innerHTML = '<div style="margin-bottom: 16px;"><strong style="color: #298398;">Original Headers:</strong></div>' + syntaxHighlightJson(content);
  } else {
    pre.innerHTML = '<div style="margin-bottom: 16px;"><strong style="color: #298398;">Original Headers:</strong></div>' + syntaxHighlightHttp(content);
  }
  
  // Forwarded headers
  if (forwardedHeaders) {
    let forwardedContent = '';
    let forwardedIsJson = false;
    
    try {
      const obj = JSON.parse(forwardedHeaders);
      forwardedContent = JSON.stringify(obj, null, 2);
      forwardedIsJson = true;
    } catch (_) {
      if (typeof forwardedHeaders === 'string' && (forwardedHeaders.includes('\n') || forwardedHeaders.includes(':'))) {
        forwardedContent = forwardedHeaders;
      } else {
        forwardedContent = String(forwardedHeaders);
      }
    }
    
    const separator = '<div style="margin: 24px 0; border-top: 2px solid #e2e8f0;"></div>';
    const forwardedTitle = '<div style="margin-bottom: 16px;"><strong style="color: #298398;">Forwarded Headers:</strong></div>';
    
    if (forwardedIsJson) {
      pre.innerHTML += separator + forwardedTitle + syntaxHighlightJson(forwardedContent);
    } else {
      pre.innerHTML += separator + forwardedTitle + syntaxHighlightHttp(forwardedContent);
    }
  }
  
  overlay.style.display = 'flex';
}

export function closeModal() {
  const overlay = document.getElementById('headers-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('modal-fade-in');
  overlay.classList.add('modal-fade-out');
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('modal-fade-out');
  }, 200);
}

export function showEndpointModal(endpoint, title) {
  const id = 'endpoint-modal-overlay';
  let overlay = document.getElementById(id);
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = id;
    overlay.className = 'modal-overlay modal-fade-in';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-header">
          <span>${title || 'Endpoint'}</span>
          <button class="modal-close" aria-label="Close">×</button>
        </div>
        <div class="modal-body"><div class="endpoint-display"></div></div>
      </div>
    `;
    document.body.appendChild(overlay);
    const closeBtn = overlay.querySelector('.modal-close');
    closeBtn.addEventListener('click', () => closeEndpointModal());
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeEndpointModal(); });
  } else {
    overlay.style.display = 'flex';
    overlay.classList.remove('modal-fade-out');
    overlay.classList.add('modal-fade-in');
    overlay.querySelector('.modal-header span').textContent = title || 'Endpoint';
  }

  const display = overlay.querySelector('.endpoint-display');
  let endpointObj = endpoint;
  if (typeof endpoint === 'string') {
    try { endpointObj = JSON.parse(endpoint); } catch (_) { endpointObj = { raw: endpoint }; }
  }

  display.innerHTML = '';

  if (endpointObj.remote_address) {
    const row = document.createElement('div');
    row.className = 'endpoint-row';
    row.innerHTML = `
      <div class="endpoint-label"><i class="fas fa-server"></i> Address</div>
      <div class="endpoint-value">${endpointObj.remote_address}${endpointObj.remote_port ? ':' + endpointObj.remote_port : ''}</div>
    `;
    display.appendChild(row);
  }

  if (endpointObj.remote_port && !endpointObj.remote_address) {
    const row = document.createElement('div');
    row.className = 'endpoint-row';
    row.innerHTML = `
      <div class="endpoint-label"><i class="fas fa-network-wired"></i> Port</div>
      <div class="endpoint-value">${endpointObj.remote_port}</div>
    `;
    display.appendChild(row);
  }

  if (endpointObj.tls !== undefined) {
    const row = document.createElement('div');
    row.className = 'endpoint-row';
    const tlsBadge = endpointObj.tls
      ? '<span class="tls-badge tls-yes">TLS Enabled</span>'
      : '<span class="tls-badge tls-no">TLS Disabled</span>';
    row.innerHTML = `
      <div class="endpoint-label"><i class="fas fa-lock"></i> TLS</div>
      <div class="endpoint-value">${tlsBadge}</div>
    `;
    display.appendChild(row);
  }

  const rawWrap = document.createElement('div');
  rawWrap.className = 'raw-json-wrap';
  const toggle = document.createElement('button');
  toggle.className = 'endpoint-view-btn raw-toggle';
  toggle.textContent = 'Show raw JSON';
  let open = false;
  const pre = document.createElement('pre');
  pre.className = 'raw-json';
  pre.innerHTML = syntaxHighlightJson(endpointObj);
  pre.style.display = 'none';
  toggle.addEventListener('click', () => {
    open = !open;
    pre.style.display = open ? 'block' : 'none';
    toggle.textContent = open ? 'Hide raw JSON' : 'Show raw JSON';
  });
  rawWrap.appendChild(toggle);
  rawWrap.appendChild(pre);
  display.appendChild(rawWrap);
}

export function closeEndpointModal() {
  const overlay = document.getElementById('endpoint-modal-overlay');
  if (!overlay) return;
  overlay.classList.remove('modal-fade-in');
  overlay.classList.add('modal-fade-out');
  setTimeout(() => {
    overlay.style.display = 'none';
    overlay.classList.remove('modal-fade-out');
  }, 200);
}
