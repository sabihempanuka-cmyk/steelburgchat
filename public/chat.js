const socket = io();

// DOM elements
const messages = document.getElementById("messages");
const input = document.getElementById("message-input");
const sendBtn = document.getElementById("send-btn");
const typingIndicator = document.getElementById("typing-indicator");
const themeToggle = document.getElementById("theme-toggle");

// Send message
sendBtn.addEventListener("click", () => {
    const text = input.value.trim();
    if (text === "") return;

    socket.emit("chatMessage", text);

    addMessage(text, true);
    input.value = "";
});

// Press Enter to send
input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        sendBtn.click();
    } else {
        socket.emit("typing");
    }
});

// Receive message
socket.on("chatMessage", (msg) => {
    addMessage(msg, false);
});

// Typing indicator
socket.on("typing", () => {
    typingIndicator.style.display = "block";
    setTimeout(() => {
        typingIndicator.style.display = "none";
    }, 1500);
});

// Add message to chat
function addMessage(text, isMine) {
    const div = document.createElement("div");
    div.classList.add("message");
    if (isMine) div.classList.add("my-message");

    div.textContent = text;
    messages.appendChild(div);

    messages.scrollTop = messages.scrollHeight;
}

// Dark mode toggle
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    themeToggle.textContent =
        document.body.classList.contains("dark-mode") ? "☀️" : "🌙";
});
