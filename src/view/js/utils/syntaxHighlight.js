// Syntax Highlighting Utilities

export function syntaxHighlightJson(json) {
  if (typeof json !== 'string') {
    json = JSON.stringify(json, null, 2);
  }
  json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return json.replace(/"(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g, function (match) {
    let cls = 'json-number';
    if (/^"/.test(match)) {
      if (/:$/.test(match)) {
        cls = 'json-key';
      } else {
        cls = 'json-string';
      }
    } else if (/true|false/.test(match)) {
      cls = 'json-boolean';
    } else if (/null/.test(match)) {
      cls = 'json-null';
    }
    return '<span class="' + cls + '">' + match + '</span>';
  });
}

export function syntaxHighlightHttp(text) {
  if (!text) return '';
  text = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  
  const lines = text.split('\n');
  const highlighted = lines.map((line, idx) => {
    if (idx === 0 && /^(GET|POST|PUT|DELETE|PATCH|HEAD|OPTIONS|CONNECT|TRACE|HTTP)/i.test(line)) {
      return '<span class="http-method">' + line + '</span>';
    } else if (line.includes(':')) {
      const colonIdx = line.indexOf(':');
      const key = line.substring(0, colonIdx);
      const val = line.substring(colonIdx);
      return '<span class="http-header-key">' + key + '</span><span class="http-header-value">' + val + '</span>';
    } else {
      return line;
    }
  });
  return highlighted.join('\n');
}
