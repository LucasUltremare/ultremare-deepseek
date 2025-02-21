document.addEventListener("DOMContentLoaded", function () {
  // Captura os elementos do chat
  const sendButton = document.getElementById("send-button");
  const userInput = document.getElementById("user-input");

  // Adiciona evento de clique no botão
  sendButton.addEventListener("click", sendMessage);

  // Permite enviar mensagem pressionando "Enter"
  userInput.addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
          event.preventDefault();
          sendMessage();
      }
  });
});

async function sendMessage() {
  const userInput = document.getElementById("user-input");
  const chatBox = document.getElementById("chat-box");
  const message = userInput.value.trim();

  if (!message) return; // Se estiver vazio, não envia

  // Exibe a mensagem do usuário no chat
  chatBox.innerHTML += `<div class="message user-message"><b>Você:</b> ${message}</div>`;
  
  // Limpa o input imediatamente para evitar duplo envio
  userInput.value = "";
  
  try {
      const response = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message })
      });

      const data = await response.json();

      // Exibe a resposta da IA no chat
      chatBox.innerHTML += `<div class="message bot-message"><b>Ultremare:</b> ${data.reply}</div>`;
  } catch (error) {
      chatBox.innerHTML += `<div class="message bot-message"><b>Erro:</b> Falha na comunicação com o servidor.</div>`;
  }

  // Faz o chat rolar para baixo automaticamente
  chatBox.scrollTop = chatBox.scrollHeight;
}
