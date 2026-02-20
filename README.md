# Local Host Service

Local Host Service is a small local web app that lets you generate simple websites from a text prompt and host them locally under `http://localhost:3000/sites/<id>/`.

Features

- Generate an HTML page from a prompt (uses OpenAI if `OPENAI_API_KEY` is set, otherwise a simple fallback template).
- Host generated HTML locally and serve it from `/sites/<id>/`.

Quick start

1. Install dependencies:

```bash
cd Local-Host-Service
npm install
```

2. (Optional) Set `OPENAI_API_KEY` to enable AI-generated HTML:

```bash
export OPENAI_API_KEY="sk-..."
```

3. Start the server:

```bash
npm start
```

4. Open the frontend at `http://localhost:3000/`.

Notes

- This is a minimal local project intended for development and experimentation. Use caution before hosting sensitive content.
- The OpenAI integration is optional and will only be used when `OPENAI_API_KEY` is present.
