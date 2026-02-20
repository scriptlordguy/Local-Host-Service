document.addEventListener('DOMContentLoaded', () => {
  const preview = document.getElementById('preview');
  const sitesList = document.getElementById('sites');
  const previewBtn = document.getElementById('preview-btn');
  const hostBtn = document.getElementById('host-btn');
  const editor = document.getElementById('editor');

  const sample = `<!doctype html><html><body><h1>Generated site (demo)</h1><p>Edit locally to use AI features.</p></body></html>`;
  editor.value = sample;
  preview.srcdoc = sample;

  previewBtn.addEventListener('click', () => preview.srcdoc = editor.value);

  hostBtn.addEventListener('click', () => {
    // On GitHub Pages demo we can't actually host — just open the preview in a new tab
    const w = window.open();
    w.document.write(editor.value);
    w.document.close();
  });

  sitesList.innerHTML = '<li>GitHub Pages demo — run the app locally to host sites.</li>';
});
