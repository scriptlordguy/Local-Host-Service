document.addEventListener('DOMContentLoaded', () => {
  const preview = document.getElementById('preview');
  const sitesList = document.getElementById('sites');
  // Simple demo content
  const sample = `<!doctype html><html><body><h1>Generated site (demo)</h1><p>Edit locally to use AI features.</p></body></html>`;
  preview.srcdoc = sample;
  sitesList.innerHTML = '<li>This is a GitHub Pages demo of the Local Host Service frontend.</li>';
});
