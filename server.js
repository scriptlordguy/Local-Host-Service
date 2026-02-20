const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || '0.0.0.0';

app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Enable simple CORS so other devices on the network can access the service
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// Serve hosted sites from ./sites via static middleware
app.use('/sites', express.static(path.join(__dirname, 'sites'), { extensions: ['html', 'htm'] }));

// Serve templates and list them
app.use('/templates', express.static(path.join(__dirname, 'templates')));

app.get('/api/templates', async (req, res) => {
  const root = path.join(__dirname, 'templates');
  try {
    const items = await fs.readdir(root);
    const templates = items.filter(n => n.endsWith('.html')).map(name => ({ name, url: `/templates/${name}` }));
    res.json({ templates });
  } catch (err) {
    res.status(500).json({ templates: [] });
  }
});

// Chat proxy to OpenAI
app.post('/api/chat', async (req, res) => {
  const { messages } = req.body;
  if (!Array.isArray(messages)) return res.status(400).json({ error: 'messages array required' });
  const openaiKey = process.env.OPENAI_API_KEY;
  if (!openaiKey) return res.status(500).json({ error: 'OpenAI API key not configured' });
  try {
    const resp = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 1500
      },
      { headers: { Authorization: `Bearer ${openaiKey}` } }
    );
    const assistant = resp.data.choices?.[0]?.message || { role: 'assistant', content: '' };
    res.json({ assistant });
  } catch (err) {
    console.error('OpenAI chat error', err?.response?.data || err.message);
    res.status(500).json({ error: 'OpenAI request failed' });
  }
});

async function generateFromPrompt(prompt) {
  const openaiKey = process.env.OPENAI_API_KEY;
  if (openaiKey) {
    try {
      const resp = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'You are a helpful website generator. Output a single self-contained HTML document' },
            { role: 'user', content: `Create a complete, self-contained HTML page for this prompt:\n${prompt}` }
          ],
          max_tokens: 1500
        },
        { headers: { Authorization: `Bearer ${openaiKey}` } }
      );
      const html = resp.data.choices?.[0]?.message?.content || '';
      return html;
    } catch (err) {
      console.error('OpenAI error', err?.response?.data || err.message);
    }
  }

  // Fallback simple generator
  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Generated Site</title>
    <style>body{font-family:Inter,system-ui,Arial;padding:24px;max-width:900px;margin:auto}</style>
  </head>
  <body>
    <h1>Website generated from prompt</h1>
    <p>${escapeHtml(prompt)}</p>
    <hr />
    <p>This is a simple fallback generator. Set OPENAI_API_KEY to enable better results.</p>
  </body>
</html>`;
}

function escapeHtml(s = '') {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'prompt required' });
  const html = await generateFromPrompt(prompt);
  res.json({ html });
});

app.post('/api/host', async (req, res) => {
  const { html, title } = req.body;
  if (!html) return res.status(400).json({ error: 'html required' });
  const id = crypto.randomBytes(6).toString('hex');
  const dir = path.join(__dirname, 'sites', id);
  try {
    await fs.mkdir(dir, { recursive: true });
    const indexPath = path.join(dir, 'index.html');
    await fs.writeFile(indexPath, html, 'utf8');
    const url = `/sites/${id}/`;
    res.json({ id, url });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'failed to host site' });
  }
});

app.get('/api/sites', async (req, res) => {
  const root = path.join(__dirname, 'sites');
  try {
    const items = await fs.readdir(root);
    const sites = [];
    for (const id of items) {
      const stat = await fs.stat(path.join(root, id));
      if (stat.isDirectory()) sites.push({ id, url: `/sites/${id}/` });
    }
    res.json({ sites });
  } catch (err) {
    res.json({ sites: [] });
  }
});

app.listen(PORT, () => {
  console.log(`Local Host Service running on http://localhost:${PORT}`);
});
