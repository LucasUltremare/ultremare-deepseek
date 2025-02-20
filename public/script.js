async function sendMessage() {
  const userInput = document.getElementById("user-input").value;
  if (!userInput) return;
  
  const chatBox = document.getElementById("chat-box");
  chatBox.innerHTML += `<p><b>Você:</b> ${userInput}</p>`;

  try {
      const response = await fetch("/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userInput })
      });

      const data = await response.json();
      chatBox.innerHTML += `<p><b>DeepSeek:</b> ${data.reply}</p>`;
  } catch (error) {
      chatBox.innerHTML += `<p><b>Erro:</b> Falha na comunicação com o servidor.</p>`;
  }

  document.getElementById("user-input").value = "";
  chatBox.scrollTop = chatBox.scrollHeight;
}
