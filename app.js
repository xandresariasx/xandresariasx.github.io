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

// Speak AI response
function speak(text) {
    const language = document.getElementById("language-select").value;
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Prioritize voices for the selected language
    const voices = window.speechSynthesis.getVoices();
    let desiredVoice;
    
    if (language === 'es') {
        desiredVoice = voices.find(v => v.lang === 'es-CO') || 
                       voices.find(v => v.lang === 'es-419') || 
                       voices.find(v => v.lang.startsWith('es-'));
    } else {
        desiredVoice = voices.find(v => v.lang === 'en-US');
    }
    
    utterance.voice = desiredVoice || voices[0];
    window.speechSynthesis.speak(utterance);
}

// Event listeners
sendButton.addEventListener("click", sendMessage);
userInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});
