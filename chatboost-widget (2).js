(function() {
  // ============================================
  // ChatBoost Widget — Bot IA Support Client
  // Développé sur mesure — v1.0
  // ============================================

  const CONFIG = {
    apiKey: 'VOTRE_CLE_OPENAI', // Remplacer par la clé OpenAI du client
    botName: 'Alex',
    storeName: 'Votre Boutique',
    primaryColor: '#0a0a0a',
    accentColor: '#4a9eff',
    position: 'bottom-right',
    welcomeMessage: 'Bonjour 👋 Je suis Alex, votre assistant. Comment puis-je vous aider ?',
    systemPrompt: `Tu es Alex, l'assistant virtuel de la boutique {STORE_NAME}.
Tu aides les clients avec leurs questions sur les commandes, la livraison, les retours et les produits.
Règles :
- Réponds TOUJOURS en français
- Sois bref et clair (maximum 3 phrases)
- Si tu ne sais pas : "Je transmets votre question à notre équipe, vous recevrez une réponse sous 24h."
- Ne donne jamais de fausses informations
- Sois professionnel et sympathique

Informations boutique :
{STORE_INFO}`,
    storeInfo: `
LIVRAISON :
- Délai standard : 3 à 5 jours ouvrés
- Livraison gratuite dès 50€
- Express 24h disponible : 5,99€
- Email de suivi envoyé à l'expédition

RETOURS :
- Acceptés sous 30 jours
- Article non porté et non lavé
- Frais de retour offerts
- Remboursement sous 5 à 7 jours

COMMANDES :
- Modification possible dans l'heure
- Annulation avant expédition
- Numéro de suivi par email

PAIEMENT :
- Visa, Mastercard, PayPal, Apple Pay
- Paiement 100% sécurisé

CONTACT :
- Email : contact@boutique.com
    `
  };

  // ============================================
  // STYLES
  // ============================================
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&display=swap');

    #chatboost-container * {
      box-sizing: border-box;
      font-family: 'DM Sans', sans-serif;
      margin: 0;
      padding: 0;
    }

    #chatboost-btn {
      position: fixed;
      bottom: 24px;
      right: 24px;
      width: 56px;
      height: 56px;
      background: ${CONFIG.primaryColor};
      border-radius: 50%;
      cursor: pointer;
      box-shadow: 0 4px 24px rgba(0,0,0,0.25);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      border: none;
    }

    #chatboost-btn:hover {
      transform: scale(1.08);
      box-shadow: 0 6px 32px rgba(0,0,0,0.3);
    }

    #chatboost-btn svg {
      width: 24px;
      height: 24px;
      fill: white;
      transition: opacity 0.2s;
    }

    #chatboost-window {
      position: fixed;
      bottom: 92px;
      right: 24px;
      width: 360px;
      height: 520px;
      background: #fff;
      border-radius: 16px;
      box-shadow: 0 8px 48px rgba(0,0,0,0.15);
      display: flex;
      flex-direction: column;
      z-index: 9998;
      overflow: hidden;
      transform: scale(0.95) translateY(10px);
      opacity: 0;
      pointer-events: none;
      transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
    }

    #chatboost-window.open {
      transform: scale(1) translateY(0);
      opacity: 1;
      pointer-events: all;
    }

    #chatboost-header {
      background: ${CONFIG.primaryColor};
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 12px;
    }

    #chatboost-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${CONFIG.accentColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 14px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
    }

    #chatboost-header-info h3 {
      font-size: 14px;
      font-weight: 600;
      color: white;
    }

    #chatboost-header-info p {
      font-size: 12px;
      color: rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      gap: 4px;
    }

    #chatboost-header-info p::before {
      content: '';
      width: 6px;
      height: 6px;
      background: #4ade80;
      border-radius: 50%;
      display: inline-block;
    }

    #chatboost-close {
      margin-left: auto;
      background: none;
      border: none;
      cursor: pointer;
      color: rgba(255,255,255,0.6);
      font-size: 20px;
      line-height: 1;
      padding: 4px;
    }

    #chatboost-close:hover {
      color: white;
    }

    #chatboost-messages {
      flex: 1;
      overflow-y: auto;
      padding: 16px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      background: #f9f9f9;
    }

    #chatboost-messages::-webkit-scrollbar {
      width: 4px;
    }

    #chatboost-messages::-webkit-scrollbar-track {
      background: transparent;
    }

    #chatboost-messages::-webkit-scrollbar-thumb {
      background: #ddd;
      border-radius: 4px;
    }

    .cb-message {
      display: flex;
      gap: 8px;
      animation: cbFadeIn 0.3s ease;
    }

    @keyframes cbFadeIn {
      from { opacity: 0; transform: translateY(6px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .cb-message.user {
      flex-direction: row-reverse;
    }

    .cb-bubble {
      max-width: 75%;
      padding: 10px 14px;
      border-radius: 12px;
      font-size: 13.5px;
      line-height: 1.6;
    }

    .cb-message.bot .cb-bubble {
      background: white;
      color: #1a1a1a;
      border-bottom-left-radius: 4px;
      box-shadow: 0 1px 4px rgba(0,0,0,0.08);
    }

    .cb-message.user .cb-bubble {
      background: ${CONFIG.primaryColor};
      color: white;
      border-bottom-right-radius: 4px;
    }

    .cb-avatar-small {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      background: ${CONFIG.accentColor};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: 600;
      color: white;
      flex-shrink: 0;
      margin-top: 2px;
    }

    .cb-typing {
      display: flex;
      gap: 4px;
      align-items: center;
      padding: 12px 14px;
    }

    .cb-typing span {
      width: 6px;
      height: 6px;
      background: #bbb;
      border-radius: 50%;
      animation: cbTyping 1.2s infinite;
    }

    .cb-typing span:nth-child(2) { animation-delay: 0.2s; }
    .cb-typing span:nth-child(3) { animation-delay: 0.4s; }

    @keyframes cbTyping {
      0%, 60%, 100% { transform: translateY(0); opacity: 0.5; }
      30% { transform: translateY(-4px); opacity: 1; }
    }

    .cb-suggestions {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 4px;
    }

    .cb-suggestion {
      background: white;
      border: 1px solid #e5e5e5;
      border-radius: 20px;
      padding: 6px 12px;
      font-size: 12px;
      color: #555;
      cursor: pointer;
      transition: all 0.15s;
      font-family: 'DM Sans', sans-serif;
    }

    .cb-suggestion:hover {
      background: ${CONFIG.primaryColor};
      color: white;
      border-color: ${CONFIG.primaryColor};
    }

    #chatboost-input-area {
      padding: 12px 16px;
      background: white;
      border-top: 1px solid #f0f0f0;
      display: flex;
      gap: 8px;
      align-items: flex-end;
    }

    #chatboost-input {
      flex: 1;
      border: 1px solid #e5e5e5;
      border-radius: 10px;
      padding: 10px 14px;
      font-size: 13.5px;
      font-family: 'DM Sans', sans-serif;
      outline: none;
      resize: none;
      max-height: 80px;
      line-height: 1.5;
      color: #1a1a1a;
      transition: border-color 0.15s;
    }

    #chatboost-input:focus {
      border-color: ${CONFIG.accentColor};
    }

    #chatboost-input::placeholder {
      color: #bbb;
    }

    #chatboost-send {
      width: 36px;
      height: 36px;
      background: ${CONFIG.primaryColor};
      border: none;
      border-radius: 10px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: opacity 0.15s;
    }

    #chatboost-send:hover {
      opacity: 0.85;
    }

    #chatboost-send svg {
      width: 16px;
      height: 16px;
      fill: white;
    }

    #chatboost-footer {
      text-align: center;
      padding: 8px;
      font-size: 10px;
      color: #ccc;
      background: white;
    }

    @media (max-width: 480px) {
      #chatboost-window {
        width: calc(100vw - 24px);
        right: 12px;
        bottom: 80px;
        height: 70vh;
      }
    }
  `;

  // ============================================
  // HTML
  // ============================================
  const html = `
    <div id="chatboost-container">
      <div id="chatboost-window">
        <div id="chatboost-header">
          <div id="chatboost-avatar">AL</div>
          <div id="chatboost-header-info">
            <h3>${CONFIG.botName} — ${CONFIG.storeName}</h3>
            <p>En ligne maintenant</p>
          </div>
          <button id="chatboost-close">×</button>
        </div>
        <div id="chatboost-messages"></div>
        <div id="chatboost-input-area">
          <textarea id="chatboost-input" placeholder="Écrivez votre message..." rows="1"></textarea>
          <button id="chatboost-send">
            <svg viewBox="0 0 24 24"><path d="M2 21l21-9L2 3v7l15 2-15 2v7z"/></svg>
          </button>
        </div>
        <div id="chatboost-footer">Propulsé par ChatBoost IA</div>
      </div>

      <button id="chatboost-btn">
        <svg viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>
      </button>
    </div>
  `;

  // ============================================
  // LOGIQUE
  // ============================================
  let conversationHistory = [];
  let isOpen = false;
  let isTyping = false;

  function init() {
    // Inject styles
    const styleEl = document.createElement('style');
    styleEl.textContent = styles;
    document.head.appendChild(styleEl);

    // Inject HTML
    const div = document.createElement('div');
    div.innerHTML = html;
    document.body.appendChild(div);

    // Events
    document.getElementById('chatboost-btn').addEventListener('click', toggleChat);
    document.getElementById('chatboost-close').addEventListener('click', closeChat);
    document.getElementById('chatboost-send').addEventListener('click', sendMessage);
    document.getElementById('chatboost-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // Message de bienvenue
    setTimeout(() => {
      addMessage('bot', CONFIG.welcomeMessage);
      addSuggestions([
        '📦 Où est ma commande ?',
        '↩️ Faire un retour',
        '🚚 Délais de livraison',
        '💬 Autre question'
      ]);
    }, 500);
  }

  function toggleChat() {
    isOpen ? closeChat() : openChat();
  }

  function openChat() {
    isOpen = true;
    document.getElementById('chatboost-window').classList.add('open');
    document.getElementById('chatboost-btn').innerHTML = '<svg viewBox="0 0 24 24" style="fill:white;width:20px;height:20px"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
    setTimeout(() => document.getElementById('chatboost-input').focus(), 300);
  }

  function closeChat() {
    isOpen = false;
    document.getElementById('chatboost-window').classList.remove('open');
    document.getElementById('chatboost-btn').innerHTML = '<svg viewBox="0 0 24 24" style="fill:white;width:24px;height:24px"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/></svg>';
  }

  function addMessage(role, text) {
    const messages = document.getElementById('chatboost-messages');
    const msg = document.createElement('div');
    msg.className = `cb-message ${role}`;

    const avatarHTML = role === 'bot'
      ? `<div class="cb-avatar-small">AL</div>`
      : '';

    msg.innerHTML = `${avatarHTML}<div class="cb-bubble">${text}</div>`;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
  }

  function addSuggestions(suggestions) {
    const messages = document.getElementById('chatboost-messages');
    const div = document.createElement('div');
    div.className = 'cb-suggestions';
    suggestions.forEach(s => {
      const btn = document.createElement('button');
      btn.className = 'cb-suggestion';
      btn.textContent = s;
      btn.addEventListener('click', () => {
        div.remove();
        handleUserMessage(s);
      });
      div.appendChild(btn);
    });
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function showTyping() {
    const messages = document.getElementById('chatboost-messages');
    const typing = document.createElement('div');
    typing.className = 'cb-message bot';
    typing.id = 'cb-typing-indicator';
    typing.innerHTML = `
      <div class="cb-avatar-small">AL</div>
      <div class="cb-bubble cb-typing">
        <span></span><span></span><span></span>
      </div>
    `;
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    const typing = document.getElementById('cb-typing-indicator');
    if (typing) typing.remove();
  }

  async function sendMessage() {
    const input = document.getElementById('chatboost-input');
    const text = input.value.trim();
    if (!text || isTyping) return;
    input.value = '';
    input.style.height = 'auto';
    handleUserMessage(text);
  }

  async function handleUserMessage(text) {
    addMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });

    isTyping = true;
    showTyping();

    try {
      const systemPrompt = CONFIG.systemPrompt
        .replace('{STORE_NAME}', CONFIG.storeName)
        .replace('{STORE_INFO}', CONFIG.storeInfo);

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            ...conversationHistory
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      const data = await response.json();
      const reply = data.choices[0].message.content;

      removeTyping();
      addMessage('bot', reply);
      conversationHistory.push({ role: 'assistant', content: reply });

    } catch (error) {
      removeTyping();
      addMessage('bot', 'Désolé, une erreur est survenue. Veuillez réessayer ou contacter notre équipe.');
    }

    isTyping = false;
  }

  // Lancement
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
