const typingIndicator = document.getElementById('typing-indicator');
const statusDot = document.querySelector('.status-dot');
const statusText = document.querySelector('.status-text');

// Professional character animations
function showTypingIndicator() {
    typingIndicator.style.display = 'block';
    statusDot.style.background = '#f39c12';
    statusText.textContent = 'Escribiendo...';
    statusText.style.color = '#f39c12';
}

function hideTypingIndicator() {
    typingIndicator.style.display = 'none';
    statusDot.style.background = '#2ecc71';
    statusText.textContent = 'En línea';
    statusText.style.color = '#2ecc71';
}

function setCharacterStatus(status, color) {
    statusDot.style.background = color;
    statusText.textContent = status;
    statusText.style.color = color;
}

// Updated sendMessage with professional animations
async function sendMessage() {
    if (isProcessing) return;
    
    const message = userInput.value.trim();
    if (!message) return;

    isProcessing = true;
    displayMessage(message, "user");
    userInput.value = "";

    // Show typing indicator
    showTypingIndicator();
    setCharacterStatus('Pensando...', '#3498db');

    try {
        const aiResponse = await getAIResponse(message);
        hideTypingIndicator();
        setCharacterStatus('En línea', '#2ecc71');
        displayMessage(aiResponse, "character");
        speak(aiResponse);
    } catch (error) {
        hideTypingIndicator();
        setCharacterStatus('Error de conexión', '#e74c3c');
        displayMessage("Lo siento, hubo un error de conexión. Por favor, intenta de nuevo.", "character");
    } finally {
        isProcessing = false;
    }
}

// Updated displayMessage with timestamps
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
async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    displayMessage(message, "user");
    userInput.value = ""; // Clear input immediately

    try {
        const aiResponse = await getAIResponse(message); // Wait for API response
        displayMessage(aiResponse, "ai");
        speak(aiResponse); // Text-to-speech
    } catch (error) {
        displayMessage("Error connecting to AI.", "ai");
    }
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
async function getAIResponse(userMessage) {   
    const API_URL = "https://api.deepseek.com/v1/chat/completions"; // Check actual API endpoint
    const API_KEY = "sk-37784acef1074ff5a51d0a26ecede385"; // 🔴 Replace with your actual key

    try {
       const response = await fetch(API_URL, {
           method: "POST",
           headers: {
               "Content-Type": "application/json",
               "Authorization": `Bearer ${API_KEY}`
           },
           body: JSON.stringify({
               model: "deepseek-chat", // Confirm model name
               messages: [
                   { role: "user", content: userMessage }
               ],
               temperature: 0.7, // Adjust creativity (0-1)
               max_tokens: 150 // Limit response length
           })
       });

       if (!response.ok) {
           throw new Error(`API Error: ${response.status}`);
       }

       const data = await response.json();
       return data.choices[0].message.content; // Extract AI reply

    } catch (error) {
       console.error("DeepSeek API Error:", error);
       return "Sorry, I couldn't fetch a response. Please try again.";
    }
}


function cleanTextForSpeech(text) {
    return text
        // Remove emojis (target specific emoji ranges only)
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
let isSpeaking = false;

function speak(text) {
    //const language = 'es';
    if (isSpeaking) {
        window.speechSynthesis.cancel(); // Stop current speech
    }
    isSpeaking = true;

    const cleanText = cleanTextForSpeech(text);
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Prioritize voices for the selected language
    const voices = window.speechSynthesis.getVoices();
    let desiredVoice;
    
    //if (language === 'es') {
       // desiredVoice = voices.find(v => v.lang === 'es-CO');// || 
        //desiredVoice = voices.find(v => v.lang === 'es-419');// || es-ES
        desiredVoice = voices.find(v => v.lang === 'es-ES');
    //                   voices.find(v => v.lang.startsWith('es-'));
    //} else {
    //    desiredVoice = voices.find(v => v.lang === 'en-US');
    //}
    
    utterance.voice = desiredVoice;// || voices[0];
    utterance.rate = 1.0;    
    utterance.onend = () => {
        isSpeaking = false;
    };    
    utterance.onerror = () => {
        isSpeaking = false;
    };
    window.speechSynthesis.speak(utterance);
    //synth.speak(utterance);
}

// Event listeners
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
