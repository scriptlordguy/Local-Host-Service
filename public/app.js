document.addEventListener('DOMContentLoaded', () => {
  const chat = document.getElementById('chat');
  const chatInput = document.getElementById('chat-input');
  const chatSend = document.getElementById('chat-send');
  const templatesList = document.getElementById('templates');
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  const previewBtn = document.getElementById('preview-btn');
  const hostBtn = document.getElementById('host-btn');
  const sitesList = document.getElementById('sites');

  const templates = [
    { name: 'Basic HTML', path: '/templates/basic.html' },
    { name: 'p5 (2D)', path: '/templates/p5.html' },
    { name: 'three.js (3D)', path: '/templates/three.html' }
  ];

  // Load templates list
  templates.forEach(t => {
    const li = document.createElement('li');
    const btn = document.createElement('button');
    btn.textContent = t.name;
    btn.addEventListener('click', async () => {
      try {
        const r = await fetch(t.path);
        const txt = await r.text();
        editor.value = txt;
        preview.srcdoc = txt;
      } catch (e) {
        alert('Failed to load template');
      }
    });
    li.appendChild(btn);
    templatesList.appendChild(li);
  });

  previewBtn.addEventListener('click', () => {
    preview.srcdoc = editor.value;
  });

  hostBtn.addEventListener('click', async () => {
    const html = editor.value || preview.srcdoc || '<!doctype html><html><body><h1>Empty</h1></body></html>';
    hostBtn.disabled = true;
    hostBtn.textContent = 'Hosting...';
    try {
      const r = await fetch('/api/host', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ html }) });
      const data = await r.json();
      if (data.url) {
        // open in new tab and copy full URL to clipboard
        const origin = window.location.origin;
        const full = origin + data.url;
        window.open(data.url, '_blank');
        if (navigator.clipboard && navigator.clipboard.writeText) {
          try { await navigator.clipboard.writeText(full); } catch (e) { /* ignore */ }
        }
        alert('Hosted at: ' + full + '\nURL copied to clipboard');
        loadSites();
      } else {
        alert('Host failed');
      }
    } catch (err) {
      alert('Host failed');
    } finally {
      hostBtn.disabled = false;
      hostBtn.textContent = 'Host';
    }
  });

  chatSend.addEventListener('click', async () => {
    const prompt = chatInput.value.trim();
    if (!prompt) return;
    const item = document.createElement('div');
    item.className = 'chat-item user';
    item.textContent = 'You: ' + prompt;
    chat.appendChild(item);
    chatInput.value = '';
    // Use /api/generate as a simple assistant (returns HTML) — show plain text response if any
    try {
      const r = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ prompt }) });
      const data = await r.json();
      const resp = data.html || 'No response';
      const reply = document.createElement('div');
      reply.className = 'chat-item ai';
      reply.textContent = resp.replace(/<[^>]+>/g, '').slice(0, 1000);
      chat.appendChild(reply);
    } catch (e) {
      const err = document.createElement('div'); err.className = 'chat-item ai'; err.textContent = 'AI error'; chat.appendChild(err);
    }
    chat.scrollTop = chat.scrollHeight;
  });

  async function loadSites() {
    try {
      const r = await fetch('/api/sites');
      const data = await r.json();
      sitesList.innerHTML = '';
      (data.sites || []).forEach(s => {
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = s.url;
        a.textContent = s.url;
        a.target = '_blank';
        li.appendChild(a);
        sitesList.appendChild(li);
      });
    } catch (err) {
      sitesList.innerHTML = '<li>Failed to load sites</li>';
    }
  }

  loadSites();
});
