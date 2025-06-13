const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OLLAMA_URL = "http://127.0.0.1:11434/api/generate";

// Regular chat endpoint
app.post('/api/ollama', async (req, res) => {
  const { userQuestion, context, history = [] } = req.body;
  let conversation = history.map(
    msg => `${msg.role === 'user' ? 'Utilisateur' : 'Assistant'}: ${msg.content}`
  ).join('\n');
  
  const prompt = `
Tu es un assistant virtuel spécialisé dans la génération de prompts pour l'IA.
Contexte: ${context}
${conversation ? conversation + '\n' : ''}Utilisateur: ${userQuestion}
Donne un prompt détaillé pour la génération d'image.
  `.trim();

  try {
    const ollamaRes = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        prompt: prompt
      }),
    });

    const text = await ollamaRes.text();
    let result = '';
    text.split('\n').forEach(line => {
      if (line.trim()) {
        try {
          const obj = JSON.parse(line);
          if (obj.response) result += obj.response;
        } catch (e) {}
      }
    });

    res.json({ response: result.trim() });
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: e.toString() });
  }
});

// Feedback endpoint
app.post('/api/ollama-feedback', async (req, res) => {
  const { lastPrompt, feedback, context } = req.body;
  const prompt = `
Tu es un assistant pour améliorer les prompts d'IA.
Dernière prompt : "${lastPrompt}"
Feedback utilisateur : "${feedback}"
Contexte : "${context}"
Génère une nouvelle version améliorée en JSON : {"positive": "prompt positive améliorée", "negative": "prompt négative améliorée"}
`.trim();

  try {
    const ollamaRes = await fetch(OLLAMA_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        prompt: prompt
      }),
    });
    
    const text = await ollamaRes.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      const data = JSON.parse(match[0]);
      res.json(data);
    } else {
      res.status(500).json({ error: "Invalid response format" });
    }
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: e.toString() });
  }
});

const PORT = 3001;
app.listen(PORT, () => console.log(`Ollama API server running on port ${PORT}`));