const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// ============================================
// PROXY OPENAI — Clé API cachée côté serveur
// ============================================
app.post('/chat', async (req, res) => {
  const { messages } = req.body;

  if (!messages) {
    return res.status(400).json({ error: 'Messages manquants' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 200,
        temperature: 0.7
      })
    });

    const data = await response.json();
    res.json(data);

  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

// ============================================
// WIDGET JS — Servi publiquement
// ============================================
app.get('/widget.js', (req, res) => {
  res.setHeader('Content-Type', 'application/javascript');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.sendFile(__dirname + '/chatboostwidget.js');
});

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ChatBoost en ligne ✅' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`ChatBoost serveur démarré sur port ${PORT}`));
