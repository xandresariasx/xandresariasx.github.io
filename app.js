// DOM Elements - Updated IDs to match your new HTML
const conversationMessages = document.getElementById("conversation-messages");
const userInput = document.getElementById("user-input");
const sendButton = document.getElementById("send-button");
const voiceButton = document.getElementById("voice-button");

// Speech Recognition (Web Speech API)
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.interimResults = false;
recognition.lang = 'es-ES'; // Changed to Spanish

// Speech Synthesis (Text-to-Speech)
const synth = window.speechSynthesis;

// Speech state management
let isSpeaking = false;
let isProcessing = false;

// Character animation elements
const typingIndicator = document.getElementById('typing-indicator');

// Professional character animations - UPDATED (removed statusDot and statusText references)
function showTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'block';
    }
}

function hideTypingIndicator() {
    if (typingIndicator) {
        typingIndicator.style.display = 'none';
    }
}

// Voice recognition with visual feedback
voiceButton.addEventListener("click", () => {
    if (voiceButton.classList.contains("listening")) {
        recognition.stop();
        voiceButton.classList.remove("listening");
        voiceButton.textContent = "🎤";
        userInput.placeholder = "Escribe tu mensaje...";
    } else {
        recognition.start();
        voiceButton.classList.add("listening");
        voiceButton.textContent = "🔴";
        userInput.placeholder = "Escuchando...";
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

recognition.addEventListener("end", () => {
    voiceButton.classList.remove("listening");
    voiceButton.textContent = "🎤";
    userInput.placeholder = "Escribe tu mensaje...";
});

// Send message function
async function sendMessage() {
    if (isProcessing) return;
    
    const message = userInput.value.trim();
    if (!message) return;

    isProcessing = true;
    displayMessage(message, "user");
    userInput.value = "";

    // Show typing indicator
    showTypingIndicator();

    try {
        const aiResponse = await getAIResponse(message);
        hideTypingIndicator();
        displayMessage(aiResponse, "character");
        speak(aiResponse);
    } catch (error) {
        hideTypingIndicator();
        displayMessage("Lo siento, hubo un error de conexión. Por favor, intenta de nuevo.", "character");
    } finally {
        isProcessing = false;
    }
}

// Display message in chat with timestamps
function displayMessage(message, sender) {
    const messageElement = document.createElement("div");
    messageElement.classList.add("message", `${sender}-message`);
    
    const now = new Date();
    const timeString = now.toLocaleTimeString('es-ES', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
        ${message}
        <div class="message-time">${timeString}</div>
    `;
    
    conversationMessages.appendChild(messageElement);
    conversationMessages.scrollTop = conversationMessages.scrollHeight;
    
    // Add fade-in effect
    addMessageEffect(messageElement);
}

// Add message effects
function addMessageEffect(messageElement) {
    messageElement.style.opacity = '0';
    messageElement.style.transform = 'translateY(20px)';
    
    setTimeout(() => {
        messageElement.style.transition = 'all 0.3s ease';
        messageElement.style.opacity = '1';
        messageElement.style.transform = 'translateY(0)';
    }, 50);
}

// DeepSeek API call
async function getAIResponse(userMessage) {   
    const API_URL = "https://api.deepseek.com/v1/chat/completions";
    const API_KEY = "sk-37784acef1074ff5a51d0a26ecede385";

    try {
       const response = await fetch(API_URL, {
           method: "POST",
           headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${API_KEY}`
           },
           body: JSON.stringify({
               model: "deepseek-chat",
               messages: [
                   { role: "user", content: userMessage }
               ],
               temperature: 0.7,
               max_tokens: 500 // Increased for better responses
           })
       });

       if (!response.ok) {
           throw new Error(`API Error: ${response.status}`);
       }

       const data = await response.json();
       return data.choices[0].message.content;

    } catch (error) {
       console.error("DeepSeek API Error:", error);
       return "Lo siento, no pudo obtener una respuesta. Por favor, intenta de nuevo.";
    }
}

// Text cleaning for speech
function cleanTextForSpeech(text) {
    return text
        // Remove emojis
        .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
        .replace(/[\u{2600}-\u{26FF}]/gu, '')
        .replace(/[\u{2700}-\u{27BF}]/gu, '')
        // Remove other symbols but KEEP Spanish letters
        .replace(/[^\w\u00C0-\u00FF\s.,!?;:()\-+='"@#$%&*\/\\]/g, '')
        // Remove problematic punctuation
        .replace(/\.{2,}/g, '.')
        .replace(/[!,;:?]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

// Speak AI response
function speak(text) {
    if (isSpeaking) {
        window.speechSynthesis.cancel();
    }
    isSpeaking = true;

    const cleanText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Wait for voices to load
    const voices = window.speechSynthesis.getVoices();
    let desiredVoice = voices.find(v => v.lang === 'es-US') || 
                      voices.find(v => v.lang === 'es-ES') ||
                      voices.find(v => v.lang.startsWith('es-')) ||
                      voices[0];
    
    utterance.voice = desiredVoice;
    utterance.rate = 1.0;
    utterance.lang = 'es-ES'; // Set language to Spanish
    
    utterance.onend = () => {
        isSpeaking = false;
    };    
    utterance.onerror = () => {
        isSpeaking = false;
    };
    
    window.speechSynthesis.speak(utterance);
}

// Event listeners
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

// Initialize voices
window.speechSynthesis.onvoiceschanged = () => {
    console.log("Voices loaded:", window.speechSynthesis.getVoices());
};
