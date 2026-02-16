(function () {
  const API_BASE = window.SCORPION_AI_API || 'http://localhost:3001/api';
  const WIDGET_ID = 'scorpion-ai-widget';

  function createStyles() {
    const style = document.createElement('style');
    style.textContent = `
      #scorpion-ai-widget { font-family: Inter, system-ui, sans-serif; }
      #scorpion-ai-panel {
        position: fixed; bottom: 90px; right: 24px; width: 380px; max-width: calc(100vw - 48px);
        background: #1a1a2e; border-radius: 16px; box-shadow: 0 10px 40px rgba(0,0,0,0.3);
        border: 1px solid rgba(212,175,55,0.2); z-index: 9998; display: none; flex-direction: column;
        max-height: 480px; overflow: hidden;
      }
      #scorpion-ai-panel.open { display: flex; animation: scorpion-ai-slide 0.25s ease; }
      @keyframes scorpion-ai-slide { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
      #scorpion-ai-header {
        padding: 14px 16px; background: rgba(212,175,55,0.1); border-bottom: 1px solid rgba(212,175,55,0.2);
        display: flex; align-items: center; justify-content: space-between;
      }
      #scorpion-ai-header h3 { margin: 0; font-size: 0.95rem; font-weight: 600; color: #D4AF37; }
      #scorpion-ai-close { background: none; border: none; color: #9ca3af; cursor: pointer; padding: 4px; }
      #scorpion-ai-close:hover { color: #fff; }
      #scorpion-ai-messages { flex: 1; overflow-y: auto; padding: 12px; min-height: 120px; }
      #scorpion-ai-messages .msg { margin-bottom: 10px; padding: 10px 12px; border-radius: 10px; font-size: 0.875rem; line-height: 1.45; }
      #scorpion-ai-messages .msg.bot { background: rgba(30,58,95,0.5); color: #e5e7eb; border-left: 3px solid #D4AF37; }
      #scorpion-ai-messages .msg.user { background: rgba(212,175,55,0.15); color: #fef3c7; margin-left: 24px; }
      #scorpion-ai-messages .msg.loading { color: #9ca3af; }
      #scorpion-ai-form { padding: 10px 12px 14px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 8px; }
      #scorpion-ai-input { flex: 1; padding: 10px 14px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.06); color: #fff; font-size: 0.875rem; outline: none; }
      #scorpion-ai-input::placeholder { color: #6b7280; }
      #scorpion-ai-send { padding: 10px 16px; border-radius: 10px; background: #D4AF37; color: #1a1a2e;
        font-weight: 600; font-size: 0.875rem; border: none; cursor: pointer; }
      #scorpion-ai-send:hover { background: #b8962e; }
      #scorpion-ai-send:disabled { opacity: 0.6; cursor: not-allowed; }
      #scorpion-ai-toggle {
        position: fixed; bottom: 24px; right: 24px; width: 56px; height: 56px; border-radius: 50%;
        background: linear-gradient(135deg, #1E3A5F, #243B53); border: 2px solid #D4AF37;
        color: #D4AF37; cursor: pointer; z-index: 9999; display: flex; align-items: center; justify-content: center;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3); transition: transform 0.2s, box-shadow 0.2s;
      }
      #scorpion-ai-toggle:hover { transform: scale(1.05); box-shadow: 0 6px 24px rgba(212,175,55,0.25); }
      #scorpion-ai-toggle svg { width: 26px; height: 26px; }
    `;
    document.head.appendChild(style);
  }

  function addMessage(container, text, isUser, isLoading) {
    const div = document.createElement('div');
    div.className = 'msg ' + (isUser ? 'user' : 'bot') + (isLoading ? ' loading' : '');
    div.textContent = text || (isLoading ? 'Thinking...' : '');
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }

  function togglePanel() {
    const panel = document.getElementById('scorpion-ai-panel');
    if (!panel) return;
    panel.classList.toggle('open');
  }

  function init() {
    if (document.getElementById(WIDGET_ID)) return;
    createStyles();

    const root = document.createElement('div');
    root.id = WIDGET_ID;

    const panel = document.createElement('div');
    panel.id = 'scorpion-ai-panel';
    panel.innerHTML = `
      <div id="scorpion-ai-header">
        <h3>Security AI Assistant</h3>
        <button id="scorpion-ai-close" type="button" aria-label="Close">✕</button>
      </div>
      <div id="scorpion-ai-messages"></div>
      <form id="scorpion-ai-form">
        <input id="scorpion-ai-input" type="text" placeholder="Ask about security, threats, best practices..." autocomplete="off" />
        <button id="scorpion-ai-send" type="submit">Send</button>
      </form>
    `;

    const toggle = document.createElement('button');
    toggle.id = 'scorpion-ai-toggle';
    toggle.type = 'button';
    toggle.setAttribute('aria-label', 'Open AI Assistant');
    toggle.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2zm0 2a8 8 0 0 0-8 8 8 8 0 0 0 8 8 8 8 0 0 0 8-8 8 8 0 0 0-8-8zm-1 3v6h2V7h-2zm0 8v2h2v-2h-2z"/></svg>';

    root.appendChild(panel);
    root.appendChild(toggle);
    document.body.appendChild(root);

    const messagesEl = document.getElementById('scorpion-ai-messages');
    const inputEl = document.getElementById('scorpion-ai-input');
    const sendBtn = document.getElementById('scorpion-ai-send');

    addMessage(messagesEl, 'Hi. I\'m your Scorpion Security AI. Ask about threats, best practices, or compliance.', false);

    document.getElementById('scorpion-ai-close').addEventListener('click', togglePanel);
    toggle.addEventListener('click', togglePanel);

    document.getElementById('scorpion-ai-form').addEventListener('submit', async function (e) {
      e.preventDefault();
      const text = inputEl.value.trim();
      if (!text) return;
      addMessage(messagesEl, text, true);
      inputEl.value = '';
      sendBtn.disabled = true;
      const loadingEl = addMessage(messagesEl, 'Thinking...', false, true);

      try {
        const res = await fetch(API_BASE + '/ai/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text }),
        });
        loadingEl.classList.remove('loading');
        let reply = '';
        const contentType = res.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          const data = await res.json().catch(function () { return {}; });
          reply = typeof data.reply === 'string' ? data.reply.trim() : '';
        }
        if (!res.ok) {
          reply = reply || 'Service error. Try again or check the API.';
        }
        if (!reply) {
          reply = 'Sorry, I couldn\'t process that. Try rephrasing or check your connection.';
        }
        loadingEl.textContent = reply;
      } catch (err) {
        loadingEl.classList.remove('loading');
        loadingEl.textContent = 'Connection error. Make sure the API is running at ' + API_BASE;
      }
      sendBtn.disabled = false;
      messagesEl.scrollTop = messagesEl.scrollHeight;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
