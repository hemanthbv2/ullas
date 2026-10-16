/**
 * R.V Institute of Technology and Management (RVITM)
 * AI-Assisted Admission Chatbot Widget with Mandatory Email Gate
 */

(function () {
  let isChatOpen = false;
  let chatHistory = [];
  let userEmail = localStorage.getItem('rvitm_user_email') || null;
  let userName = localStorage.getItem('rvitm_user_name') || null;
  let isSoundEnabled = true;

  // DOM Elements
  let fabBtn, chatWindow, chatMessages, chatInput, sendBtn, closeBtn, clearBtn, suggestionsContainer, soundBtn;
  let chatGateView, chatConversationView, gateEmailInput, gateNameInput, gateSubmitBtn, gateErrorText;

  document.addEventListener('DOMContentLoaded', () => {
    initChatbotElements();
    setupEventListeners();
    updateViewState();
  });

  function initChatbotElements() {
    fabBtn = document.getElementById('chat-fab');
    chatWindow = document.getElementById('chatbot-window');
    chatMessages = document.getElementById('chat-messages');
    chatInput = document.getElementById('chat-input');
    sendBtn = document.getElementById('chat-send-btn');
    closeBtn = document.getElementById('chat-close-btn');
    clearBtn = document.getElementById('chat-clear-btn');
    soundBtn = document.getElementById('chat-sound-btn');
    suggestionsContainer = document.getElementById('chat-suggestions');

    chatGateView = document.getElementById('chat-gate-view');
    chatConversationView = document.getElementById('chat-conversation-view');
    gateEmailInput = document.getElementById('gate-email-input');
    gateNameInput = document.getElementById('gate-name-input');
    gateSubmitBtn = document.getElementById('gate-submit-chat-btn');
    gateErrorText = document.getElementById('gate-error-text');

    // Email badge & switch button
    const chatUserBadge = document.getElementById('chat-user-badge');
    const chatCurrentEmail = document.getElementById('chat-current-email');
    const chatChangeEmailBtn = document.getElementById('chat-change-email-btn');
    const chatGateForm = document.getElementById('chat-gate-form');

    if (chatGateForm) {
      chatGateForm.addEventListener('submit', (e) => {
        e.preventDefault();
        handleGateSubmit(e);
      });
    }

    if (chatChangeEmailBtn) {
      chatChangeEmailBtn.addEventListener('click', (e) => {
        e.preventDefault();
        resetEmailVerification();
      });
    }
  }

  function resetEmailVerification() {
    userEmail = null;
    userName = null;
    localStorage.removeItem('rvitm_user_email');
    localStorage.removeItem('rvitm_user_name');
    if (gateEmailInput) {
      gateEmailInput.value = '';
    }
    if (gateErrorText) {
      gateErrorText.style.display = 'none';
      gateErrorText.innerText = '';
    }
    updateViewState();
    if (gateEmailInput) {
      setTimeout(() => gateEmailInput.focus(), 150);
    }
  }

  function updateViewState() {
    if (!chatGateView || !chatConversationView) return;

    const chatUserBadge = document.getElementById('chat-user-badge');
    const chatCurrentEmail = document.getElementById('chat-current-email');

    if (userEmail) {
      chatGateView.style.display = 'none';
      chatConversationView.style.display = 'flex';
      if (chatUserBadge && chatCurrentEmail) {
        chatCurrentEmail.innerText = userEmail;
        chatUserBadge.style.display = 'flex';
      }
    } else {
      chatGateView.style.display = 'flex';
      chatConversationView.style.display = 'none';
      if (chatUserBadge) {
        chatUserBadge.style.display = 'none';
      }
    }
  }

  function setupEventListeners() {
    if (fabBtn) {
      fabBtn.addEventListener('click', toggleChat);
    }
    if (closeBtn) {
      closeBtn.addEventListener('click', closeChat);
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', clearChat);
    }
    if (soundBtn) {
      soundBtn.addEventListener('click', toggleSound);
    }

    if (gateSubmitBtn) {
      gateSubmitBtn.addEventListener('click', (e) => {
        e.preventDefault();
        handleGateSubmit(e);
      });
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', () => {
        handleUserSend();
      });
    }

    if (chatInput) {
      chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleUserSend();
        }
      });
    }

    // Initialize Chip Scroller (drag slide + mouse wheel scroll) and click handlers
    initChipScroller();

    // Global trigger function to open chat
    window.openAdmissionChat = function (initialQuery) {
      openChat();
      if (initialQuery) {
        if (userEmail) {
          setTimeout(() => {
            sendUserMessage(initialQuery);
          }, 300);
        } else {
          pendingQuery = initialQuery;
          if (gateEmailInput) {
            gateEmailInput.focus();
            showGateError(`Please enter your email to ask: "${initialQuery}"`);
          }
        }
      }
    };

    // Public API
    window.RVITMChatbot = {
      open: openChat,
      close: closeChat,
      setUserEmail: (email, name) => {
        userEmail = email;
        userName = name;
        localStorage.setItem('rvitm_user_email', email);
        if (name) localStorage.setItem('rvitm_user_name', name);
        updateViewState();
      },
      resetEmail: resetEmailVerification,
      addSystemMessage: (text) => {
        renderMessage('bot', text);
      }
    };
  }

  let pendingQuery = null;

  function initChipScroller() {
    if (!suggestionsContainer) return;

    // 1. Mouse wheel horizontal scrolling
    suggestionsContainer.addEventListener('wheel', (e) => {
      if (e.deltaY !== 0) {
        e.preventDefault();
        suggestionsContainer.scrollLeft += e.deltaY;
      }
    }, { passive: false });

    // 2. Click and Drag to slide sideways
    let isDown = false;
    let startX, scrollLeft;

    suggestionsContainer.addEventListener('mousedown', (e) => {
      isDown = true;
      startX = e.pageX - suggestionsContainer.offsetLeft;
      scrollLeft = suggestionsContainer.scrollLeft;
    });

    suggestionsContainer.addEventListener('mouseleave', () => {
      isDown = false;
    });

    suggestionsContainer.addEventListener('mouseup', () => {
      isDown = false;
    });

    suggestionsContainer.addEventListener('mousemove', (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - suggestionsContainer.offsetLeft;
      const walk = (x - startX) * 1.5;
      suggestionsContainer.scrollLeft = scrollLeft - walk;
    });

    // 3. Bind click events to all existing suggestion chips
    bindExistingChips();
  }

  function bindExistingChips() {
    if (!suggestionsContainer) return;
    const chips = suggestionsContainer.querySelectorAll('.suggestion-chip');
    chips.forEach(chip => {
      chip.onclick = () => {
        handleChipClick(chip.innerText);
      };
    });
  }

  function handleChipClick(text) {
    if (!userEmail) {
      pendingQuery = text;
      updateViewState();
      if (gateEmailInput) {
        gateEmailInput.focus();
        showGateError(`Please enter your email to ask about: "${text}"`);
      }
      return;
    }
    sendUserMessage(text);
  }

  async function handleGateSubmit() {
    const email = gateEmailInput.value.trim();
    const name = (gateNameInput ? gateNameInput.value.trim() : '') || 'Prospective Student';

    const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
    if (!email) {
      showGateError('Please enter your email ID to begin.');
      return;
    }
    if (!emailRegex.test(email)) {
      showGateError('Please enter a valid email address.');
      return;
    }

    gateSubmitBtn.disabled = true;
    gateSubmitBtn.innerText = 'Connecting...';

    try {
      const res = await fetch('/api/register-visitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name })
      });
      const data = await res.json();

      if (data.success) {
        userEmail = email;
        userName = name;
        localStorage.setItem('rvitm_user_email', email);
        localStorage.setItem('rvitm_user_name', name);
        updateViewState();

        renderMessage('bot', `👋 **Welcome, ${name}!**\n\nYour consultation session is activated for **${email}**.\n\nI am your **RVITM AI Admission Advisor**. Ask me anything about KCET/COMEDK cutoffs, B.E. programs, scholarships, or campus facilities in JP Nagar, Bengaluru!`);

        // Execute pending chip query if user clicked a chip before submitting email
        if (pendingQuery) {
          const q = pendingQuery;
          pendingQuery = null;
          setTimeout(() => {
            sendUserMessage(q);
          }, 400);
        } else if (chatInput) {
          chatInput.focus();
        }
      } else {
        showGateError(data.message || 'Unable to register email.');
      }
    } catch (err) {
      showGateError('Connection error. Please try again.');
    } finally {
      gateSubmitBtn.disabled = false;
      gateSubmitBtn.innerText = 'Start Chatting →';
    }
  }

  function showGateError(msg) {
    if (gateErrorText) {
      gateErrorText.innerText = msg;
      gateErrorText.style.display = 'block';
    }
  }

  function toggleChat() {
    if (isChatOpen) {
      closeChat();
    } else {
      openChat();
    }
  }

  function openChat() {
    isChatOpen = true;
    chatWindow.classList.add('open');
    updateViewState();
    if (userEmail && chatInput) {
      chatInput.focus();
    } else if (gateEmailInput) {
      gateEmailInput.focus();
    }
  }

  function closeChat() {
    isChatOpen = false;
    chatWindow.classList.remove('open');
  }

  function toggleSound() {
    isSoundEnabled = !isSoundEnabled;
    if (soundBtn) {
      soundBtn.style.opacity = isSoundEnabled ? '1' : '0.4';
    }
  }

  function clearChat() {
    if (!chatMessages) return;
    chatMessages.innerHTML = `
      <div class="chat-bubble bot">
        👋 <strong>Conversation reset.</strong><br>
        I'm your <strong>RVITM AI Admission Advisor</strong>. Ask me about KCET/COMEDK cutoffs, B.E. branches (CSE, AI & ML, ISE, ECE), fee structures, or RV placements!<br>
        <button type="button" onclick="if(window.RVITMChatbot)window.RVITMChatbot.resetEmail();" style="margin-top:8px;display:inline-flex;align-items:center;gap:4px;background:rgba(56,189,248,0.15);border:1px solid rgba(56,189,248,0.3);color:#38bdf8;padding:4px 10px;border-radius:6px;font-size:0.75rem;cursor:pointer;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
          Switch / Re-verify Email
        </button>
        <span class="bubble-time">Just now</span>
      </div>
      <div id="typing-indicator" class="typing-indicator">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>
    `;
    chatHistory = [];
    renderSuggestions([
      "💻 B.E. Computer Science",
      "🤖 B.E. AI & ML",
      "🎯 KCET & COMEDK Cutoffs",
      "💰 Fee Structure & Quotas",
      "🚀 Placement Records"
    ]);
  }

  function handleUserSend() {
    const text = chatInput.value.trim();
    if (!text) return;

    if (!userEmail) {
      updateViewState();
      return;
    }

    chatInput.value = '';
    sendUserMessage(text);
  }

  async function sendUserMessage(text) {
    renderMessage('user', text);
    chatHistory.push({ sender: 'user', message: text });

    showTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatHistory.slice(-6),
          email: userEmail,
          name: userName
        })
      });

      const data = await response.json();
      showTyping(false);

      if (data.success) {
        renderMessage('bot', data.reply);
        chatHistory.push({ sender: 'bot', message: data.reply });

        if (data.suggestions && data.suggestions.length > 0) {
          renderSuggestions(data.suggestions);
        }

        if (data.action) {
          handleBotAction(data.action);
        }

        playChime();
      } else if (data.requires_email) {
        userEmail = null;
        localStorage.removeItem('rvitm_user_email');
        updateViewState();
        showGateError('Please enter your email to continue.');
      } else {
        renderMessage('bot', 'I encountered an issue processing your query. Please feel free to select one of the suggested topics or submit an admission enquiry.');
      }
    } catch (err) {
      console.error(err);
      showTyping(false);
      renderMessage('bot', '⚠️ Connection error. Please verify the RVITM server is running or try again in a moment.');
    }
  }

  function handleBotAction(action) {
    if (action.type === 'scroll_to') {
      const target = document.querySelector(action.target);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    } else if (action.type === 'fill_enquiry') {
      if (typeof window.selectProgramInForm === 'function') {
        window.selectProgramInForm(action.program);
      }
    }
  }

  function renderMessage(sender, text) {
    const bubble = document.createElement('div');
    bubble.className = `chat-bubble ${sender}`;

    const formattedContent = formatMarkdown(text);
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    bubble.innerHTML = `
      ${formattedContent}
      <span class="bubble-time">${timeStr}</span>
    `;

    const typing = document.getElementById('typing-indicator');
    if (typing && typing.parentNode === chatMessages) {
      chatMessages.insertBefore(bubble, typing);
    } else {
      chatMessages.appendChild(bubble);
    }

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  function renderSuggestions(suggestions) {
    if (!suggestionsContainer) return;
    suggestionsContainer.innerHTML = '';

    suggestions.forEach(item => {
      const chip = document.createElement('button');
      chip.className = 'suggestion-chip';
      chip.type = 'button';
      chip.innerText = item;
      chip.addEventListener('click', () => {
        handleChipClick(item);
      });
      suggestionsContainer.appendChild(chip);
    });
    suggestionsContainer.scrollLeft = 0;
  }

  function showTyping(show) {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
      if (show) {
        indicator.classList.add('active');
        chatMessages.scrollTop = chatMessages.scrollHeight;
      } else {
        indicator.classList.remove('active');
      }
    }
  }

  function formatMarkdown(text) {
    if (!text) return '';
    let parsed = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>')
      .replace(/^(?:•|-|\*)\s+(.*)$/gm, '<li>$1</li>')
      .replace(/(<li>.*?<\/li>(\s*<li>.*?<\/li>)*)/gs, '<ul>$1</ul>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');

    return parsed;
  }

  function playChime() {
    if (!isSoundEnabled) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch (e) { }
  }
})();
