// ===========================================================
// CONVERSATION-VIEW.JS — abertura e render das mensagens
// ===========================================================
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

  // ---------------------------------------------------------
  // renderizar mensagens
  // ---------------------------------------------------------
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
          </div>
        `;
      })
      .join("");

    msgBox.scrollTop = msgBox.scrollHeight;
  }

  // ---------------------------------------------------------
  // indicador "digitando..."
  // ---------------------------------------------------------
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

  // ---------------------------------------------------------
  // enviar evento de digitação
  // ---------------------------------------------------------
  function sendTyping() {
    if (!canSendTyping) return;
    canSendTyping = false;

    supabase.from("typing").insert({
      conversation_id: activeConversationId,
      user_id: activeUserId,
    });

    setTimeout(() => (canSendTyping = true), 1200);
  }

  // ---------------------------------------------------------
  // abrir conversa
  // ---------------------------------------------------------
  async function open(conversation, currentUserId) {
    activeConversationId = conversation.id;
    activeUserId = currentUserId;

    listBox.classList.add("hidden");
    conversationBox.classList.remove("hidden");

    const finalizada = conversation.finalizada === true;

    conversationBox.innerHTML = `
      <div id="chatHeader" class="chat-header">
        <button id="backToList" class="chat-back">←</button>

        <h3>
          ${conversation.items?.titulo || "Negociação"}
          ${
            finalizada ? `<span class="chat-ended-tag">Finalizada ✓</span>` : ""
          }
        </h3>

        <button id="chatClose" class="chat-close">×</button>
      </div>

      <div id="messagesWrapper" class="messages-wrapper"></div>

      <div class="chat-input-box ${finalizada ? "disabled" : ""}">
        <input 
          id="chatMessageInput"
          type="text"
          placeholder="${
            finalizada ? "Negociação finalizada" : "Digite uma mensagem..."
          }"
          ${finalizada ? "disabled" : ""}
        />
        <button id="chatSendBtn" ${finalizada ? "disabled" : ""}>Enviar</button>
      </div>
    `;

    msgBox = document.getElementById("messagesWrapper");
    input = document.getElementById("chatMessageInput");
    sendBtn = document.getElementById("chatSendBtn");

    // voltar para lista
    document.getElementById("backToList").onclick = () => {
      conversationBox.classList.add("hidden");
      listBox.classList.remove("hidden");
    };

    // fechar modal
    document.getElementById("chatClose").onclick = () => {
      const modal = document.getElementById("chatModal");
      modal.classList.remove("open");
      setTimeout(() => modal.classList.add("hidden"), 150);
    };

    // carregar histórico
    messages = await service.getMessages(activeConversationId);
    renderMessages();

    // -----------------------------------------------------
    // marcar como LIDAS todas as mensagens recebidas
    // -----------------------------------------------------
    await supabase
      .from("messages")
      .update({ lida: true })
      .eq("conversation_id", activeConversationId)
      .neq("sender_id", activeUserId);

    // se finalizada → bloqueia envio
    if (finalizada) return;

    // enviar mensagem
    sendBtn.onclick = async () => {
      const txt = input.value.trim();
      if (!txt) return;

      const msg = await service.sendMessage(
        activeConversationId,
        activeUserId,
        txt
      );

      if (!msg) return;

      messages.push(msg);
      renderMessages();
      input.value = "";
    };

    // Enter para enviar
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        sendBtn.click();
      }
    });

    // evento de digitação
    input.addEventListener("input", () => {
      sendTyping();
    });
  }

  // ---------------------------------------------------------
  // nova mensagem ao vivo
  // ---------------------------------------------------------
  function handleIncomingMessage(msg) {
    messages.push(msg);
    renderMessages();
  }

  return {
    open,
    handleIncomingMessage,
    showTypingIndicator,
    getActiveConversationId() {
      return activeConversationId;
    },
  };
};
