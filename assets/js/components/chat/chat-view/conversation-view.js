// assets/js/components/chat/chat-view/conversation-view.js
window.initConversationView = function (service, supabase) {
  const listBox = document.getElementById("chatList");
  const conversationBox = document.getElementById("chatConversation");

  let activeConversationId = null;
  let activeUserId = null;
  let messages = [];
  let msgBox = null;
  let input = null;
  let sendBtn = null;

  let typingTimer = null;
  let canSendTyping = true;

  // ================================
  function renderMessages() {
    if (!msgBox) return;

    msgBox.innerHTML = messages
      .map((m) => {
        const hora = new Date(m.enviado_em).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return `
        <div class="msg ${m.sender_id === activeUserId ? "me" : "them"}">
          ${m.conteudo}
          <small class="msg-time">${hora}</small>
        </div>`;
      })
      .join("");

    msgBox.scrollTop = msgBox.scrollHeight;
  }

  // ================================
  function showTypingIndicator() {
    if (!msgBox) return;

    document.querySelector(".typing-indicator")?.remove();

    const el = document.createElement("div");
    el.className = "typing-indicator";
    el.innerHTML = `
      <span class="dot"></span>
      <span class="dot"></span>
      <span class="dot"></span>
    `;

    msgBox.appendChild(el);
    msgBox.scrollTop = msgBox.scrollHeight;

    clearTimeout(typingTimer);
    typingTimer = setTimeout(() => el.remove(), 1800);
  }

  // ================================
  function sendTyping() {
    if (!canSendTyping) return;
    canSendTyping = false;

    supabase.from("typing").insert({
      conversation_id: activeConversationId,
      user_id: activeUserId,
    });

    setTimeout(() => (canSendTyping = true), 1200);
  }

  // ================================
  async function open(conversation, currentUserId) {
    activeConversationId = conversation.id;
    activeUserId = currentUserId;

    listBox.classList.add("hidden");
    conversationBox.classList.remove("hidden");

    conversationBox.innerHTML = `
      <div id="chatHeader" class="chat-header">
        <button id="backToList" class="chat-back">←</button>
        <h3>${conversation.items?.titulo || "Negociação"}</h3>
        <button id="chatClose" class="chat-close">×</button>
      </div>

      <div id="messagesWrapper" class="messages-wrapper"></div>

      <div class="chat-input-box">
        <input id="chatMessageInput" type="text" placeholder="Digite..." />
        <button id="chatSendBtn">Enviar</button>
      </div>
    `;

    msgBox = document.getElementById("messagesWrapper");
    input = document.getElementById("chatMessageInput");
    sendBtn = document.getElementById("chatSendBtn");

    // voltar
    document.getElementById("backToList").onclick = () => {
      conversationBox.classList.add("hidden");
      listBox.classList.remove("hidden");
    };

    // fechar
    document.getElementById("chatClose").onclick = () => {
      document.getElementById("chatModal").classList.remove("open");
      setTimeout(
        () => document.getElementById("chatModal").classList.add("hidden"),
        150
      );
    };

    // carregar mensagens
    messages = await service.getMessages(activeConversationId);
    renderMessages();

    // enviar mensagem
    sendBtn.onclick = async () => {
      const txt = input.value.trim();
      if (!txt) return;

      const msg = await service.sendMessage(
        activeConversationId,
        activeUserId,
        txt
      );

      messages.push(msg);
      renderMessages();
      input.value = "";
    };

    // enter
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
      }
    });

    // typing
    input.addEventListener("input", () => {
      sendTyping();
    });
  }

  return {
    open,
    handleIncomingMessage(msg) {
      messages.push(msg);
      renderMessages();
    },
    getActiveConversationId() {
      return activeConversationId;
    },
    showTypingIndicator,
  };
};
