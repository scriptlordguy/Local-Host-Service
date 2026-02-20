async function $(sel) { return document.querySelector(sel); }
const promptEl = await $('#prompt');
const preview = await $('#preview');
const generateBtn = await $('#generate');
const hostBtn = await $('#host');
const sitesList = await $('#sites');

let lastHtml = '';

generateBtn.addEventListener('click', async () => {
  const prompt = promptEl.value.trim();
  if (!prompt) return alert('Enter a prompt');
  generateBtn.disabled = true;
  generateBtn.textContent = 'Generating...';
  try {
    const r = await fetch('/api/generate', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ prompt }) });
    const data = await r.json();
    lastHtml = data.html || '';
    preview.srcdoc = lastHtml;
    hostBtn.disabled = false;
  } catch (err) {
    alert('Generate failed');
  } finally {
    generateBtn.disabled = false;
    generateBtn.textContent = 'Generate';
  }
});

hostBtn.addEventListener('click', async () => {
  if (!lastHtml) return alert('No generated HTML to host');
  hostBtn.disabled = true;
  hostBtn.textContent = 'Hosting...';
  try {
    const r = await fetch('/api/host', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ html: lastHtml }) });
    const data = await r.json();
    if (data.url) {
      alert('Hosted at: ' + data.url);
      loadSites();
    }
  } catch (err) {
    alert('Host failed');
  } finally {
    hostBtn.disabled = false;
    hostBtn.textContent = 'Host Generated';
  }
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
