const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
app.use(cors());
app.use(express.json());

app.post('/chat', async (req, res) => {
  const { messages } = req.body;
  if (!messages) return res.status(400).json({ error: 'Messages manquants' });

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama3-8b-8192',
        messages,
        max_tokens: 200,
        temperature: 0.7
      })
    });
    const data = await response.json();
    console.log('Groq:', JSON.stringify(data).substring(0, 200));
    res.json(data);
  } catch (error) {
    console.error('Erreur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/widget.js', (req, res) => {
  const files = ['chatboost-widget.js', 'chatboostwidget.js'];
  let filePath = null;
  for (const f of files) {
    const p = path.join(__dirname, f);
    if (fs.existsSync(p)) { filePath = p; console.log('Widget:', f); break; }
  }
  if (!filePath) return res.status(404).send('Widget non trouvé');
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(filePath);
});

app.get('/', (req, res) => res.json({ status: 'ChatBoost en ligne ✅' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ChatBoost serveur démarré sur port ${PORT}`));
