// DOM Elements
const chatMessages = document.getElementById("chat-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const micButton = document.getElementById("mic-button");

// Speech Recognition (Web Speech API)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.lang = 'en-US';

// Speech Synthesis (Text-to-Speech)
const synth = window.speechSynthesis;

// Toggle microphone
micButton.addEventListener("click", () => {
    if (micButton.textContent === "🎤") {
        recognition.start();
        micButton.textContent = "🔴";
        userInput.placeholder = "Listening...";
    } else {
        recognition.stop();
        micButton.textContent = "🎤";
        userInput.placeholder = "Type your message...";
    }
});

// Speech recognition result
recognition.addEventListener("result", (e) => {
    const transcript = Array.from(e.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join("");
    userInput.value = transcript;
    sendMessage(); // Auto-send after speech
});

// Send message function
function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    // Display user message
    displayMessage(message, "user");

    // Simulate AI response (replace with actual API call)
    setTimeout(() => {
        const aiResponse = getAIResponse(message);
        displayMessage(aiResponse, "ai");
        speak(aiResponse); // Text-to-speech
    }, 1000);

    userInput.value = "";
}

// Display message in chat
function displayMessage(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);
    messageElement.textContent = message;
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Simulate AI response (Replace with DeepSeek API later)
function getAIResponse(userMessage) {
    const responses = [
        "I'm an AI assistant. How can I help you?",
        "Interesting! Tell me more.",
        "I don't have a real API connection yet, but you can integrate DeepSeek later!",
        "Thanks for your message!"
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

// Speak AI response
function speak(text) {
    const utterance = new SpeechSynthesisUtterance(text);
    synth.speak(utterance);
}

// Event listeners
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});