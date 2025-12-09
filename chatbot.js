// Chatbot functionality
const chatbotButton = document.getElementById('chatbot-button');
const chatbotContainer = document.getElementById('chatbot-container');
const closeChatbot = document.getElementById('close-chatbot');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotInput = document.getElementById('chatbot-input');
const sendButton = document.getElementById('send-button');
const suggestionButtons = document.querySelectorAll('.suggestion-btn');

// Groq API Configuration
const GROQ_BASE_URL = 'https://api.groq.com/openai/v1';
let groqApiKeyPromise;

// Load GROQ API key from .env (served alongside the app) or from window.__ENV fallback
async function loadGroqApiKey() {
    if (groqApiKeyPromise) return groqApiKeyPromise;

    groqApiKeyPromise = (async () => {
        // Prefer window.__ENV if injected by the host
        if (typeof window !== 'undefined' && window.__ENV && window.__ENV.GROQ_API_KEY) {
            return window.__ENV.GROQ_API_KEY.trim();
        }

        try {
            const response = await fetch('.env');
            if (!response.ok) throw new Error('Cannot load .env');
            const text = await response.text();
            const match = text.match(/^GROQ_API_KEY=(.*)$/m);
            return match && match[1] ? match[1].trim() : '';
        } catch (err) {
            console.error('Failed to load GROQ_API_KEY from .env', err);
            return '';
        }
    })();

    return groqApiKeyPromise;
}

// Portfolio context from index.html
const PORTFOLIO_CONTEXT = `
You are an AI assistant for Hari, an AI Developer. You should ONLY answer questions based on the following information about Hari. Do not make up information or provide details not mentioned below.

PERSONAL INFO:
- Name: Hari
- Role: AI Developer
- Vision: Building intelligent, scalable solutions that bridge innovation with real-world impact. Making AI accessible, efficient, and ethically built for everyone.

AREAS OF EXPERTISE:
1. AI Application Development - End-to-end ML application development for production
2. RAG & Chatbot Systems - Retrieval-augmented systems and conversational agents
3. LLM System Engineering - Optimizing LLM pipelines and inference at scale

WORK EXPERIENCE:
1. LogicGo Infotech - AI Developer (August 2025 – present)

2. Punchbiz - Full Stack AI Developer (July 2024 – December 2024)
   - Key Project: AI Inventory Management
   - Developed a scalable AI-powered enterprise billing system using React, Node.js, and PostgreSQL
   - Integrated OCR to automate data entry, reducing manual effort by 40%

3. Centillion Labs - AI Developer (December 2023 – April 2024)
   - Key Project: Multi-LLM System for Enterprises
   - Developed Aristotle AI chatbot using React and Python
   - Optimized AI models and backend systems, improving response time by 30% and accuracy by 20%

TECHNICAL SKILLS:
Languages: Python, Java, C, JavaScript
Frameworks & Libraries: React.js, Node.js, Express.js, TensorFlow, PyTorch, Keras, OpenCV, LangChain
Databases & Cloud: PostgreSQL, MongoDB, SQL, AWS, Docker
Tools: Git, Power BI, Figma, Jupyter Notebook

EDUCATION:
- B.Tech in Artificial Intelligence & Machine Learning
- Kongu Engineering College, India
- Graduation Year: 2026

KEY PROJECTS:
1. Job Automation Platform - AI-driven platform for automated job applications using ATS, bots, and Gemini API
   GitHub: https://github.com/Hari-Kec/AI-Career-Accelerator

2. Yoga Pose Detection - Real-time pose correction web app using TensorFlow & MediaPipe with <200ms latency
   GitHub: https://github.com/Hari-Kec/Yoga-Pose-Detection-and-Correction

3. Crater & Boulder Detection - ML model detecting lunar craters from Chandrayaan-2 images with 90% accuracy
   GitHub: https://github.com/Hari-Kec/CratersAndBouldersDetection

4. GAN-Based Malware Detection - AI-powered malware detection using GAN framework for zero-day threats
   GitHub: https://github.com/Hari-Kec/GAN-Based-Zero-Day-Malware-Detection

5. Face-Based Attendance System - Real-time facial recognition attendance solution
   GitHub: https://github.com/Hari-Kec/Face_based_attendance_system.git

6. Ingredient Healthy Checker - AI tool using OCR & LLM to analyze product ingredients and assess healthiness
   GitHub: https://github.com/Hari-Kec/Ingridient_Healthy_Checker

BLOGS:
1. "How to Crack Off-Campus Placements as a fresher: A Step-by-Step Guide"
   Link: https://medium.com/@hari-s/how-to-crack-off-campus-placements-as-a-fresher-a-step-by-step-guide-2a2b32c39b07

2. "How to choose the best industry level project as college student?"
   Link: https://medium.com/@hari-s/how-to-choose-the-best-industry-level-projects-as-a-college-student-a-technical-blueprint-bf79df3fa490

3. "The impact of AI on human creativity and how to use it effectively"
   Link: https://medium.com/@hari-s/the-impact-of-ai-on-human-creativity-and-how-to-use-it-effectively-82315b87d72c

4. "Why every developer should build a personal website (beyond just a resume)?"
   Link: https://medium.com/@hari-s/why-every-developer-should-build-a-personal-project-beyond-just-a-resume-f010024696aa

RESEARCH PAPERS:
- "Fake social media detection using machine learning" — IEEE, 2024

CONTACT:
- Email: harisenthilcbe@gmail.com
- Topmate: https://topmate.io/hari_ai
- GitHub: https://github.com/Hari-Kec
- LinkedIn: https://www.linkedin.com/in/h-a-r-i
- Instagram: https://www.instagram.com/h.a.r.i_12/?hl=en
- Twitter: https://x.com/harisenthilcbe

IMPORTANT INSTRUCTIONS:
- Only answer questions based on the information provided above
- If asked about something not mentioned above, politely say you don't have that information
- Be friendly and professional
- Keep responses concise and relevant
- If asked about technical details not mentioned, say that specific detail isn't available in Hari's portfolio
`;

// Toggle chatbot
chatbotButton.addEventListener('click', () => {
    chatbotContainer.classList.add('active');
    chatbotButton.style.display = 'none';
    chatbotInput.focus();
});

closeChatbot.addEventListener('click', () => {
    chatbotContainer.classList.remove('active');
    chatbotButton.style.display = 'flex';
});

// Format response text with markdown-like formatting
function formatResponse(text) {
    // Replace line breaks with <br>
    let formatted = text.replace(/\n/g, '<br>');
    
    // Format bullet points (-, *, •)
    formatted = formatted.replace(/^[\-\*\•]\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive <li> in <ul>
    formatted = formatted.replace(/(<li>.*<\/li>(?:<br>)?)+/g, (match) => {
        return '<ul>' + match.replace(/<br>/g, '') + '</ul>';
    });
    
    // Format numbered lists
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    formatted = formatted.replace(/(<li>.*<\/li>(?:<br>)?)+/g, (match) => {
        if (!match.includes('<ul>')) {
            return '<ol>' + match.replace(/<br>/g, '') + '</ol>';
        }
        return match;
    });
    
    // Format bold text (**text** or __text__)
    formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Format italic text (*text* or _text_)
    formatted = formatted.replace(/\*(.+?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.+?)_/g, '<em>$1</em>');
    
    // Format URLs as clickable links while keeping the visible text exactly as in the response
    formatted = formatted.replace(/https?:\/\/[^\s<]+/g, (url) => {
        const match = url.match(/^(.*?)([).,;:!?\]]+)?$/);
        const cleanUrl = match ? match[1] : url;
        const trailing = match && match[2] ? match[2] : '';
        return `<a href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>${trailing}`;
    });
    
    // Format inline code
    formatted = formatted.replace(/`(.+?)`/g, '<code>$1</code>');
    
    return formatted;
}

// Add message to chat
function addMessage(message, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    // Format bot messages, keep user messages plain
    const formattedMessage = isUser ? message : formatResponse(message);
    
    messageDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas ${isUser ? 'fa-user' : 'fa-robot'}"></i>
        </div>
        <div class="message-content">
            <p>${formattedMessage}</p>
        </div>
    `;
    
    chatbotMessages.appendChild(messageDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Add typing indicator
function addTypingIndicator() {
    const typingDiv = document.createElement('div');
    typingDiv.className = 'message bot-message';
    typingDiv.id = 'typing-indicator';
    
    typingDiv.innerHTML = `
        <div class="message-avatar">
            <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    `;
    
    chatbotMessages.appendChild(typingDiv);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

// Remove typing indicator
function removeTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

// Send message to Groq API
async function sendToGroq(userMessage) {
    try {
        const apiKey = await loadGroqApiKey();
        if (!apiKey) {
            return "I apologize, but I can't access the GROQ API key right now. Please confirm the .env file is accessible.";
        }

        const response = await fetch(`${GROQ_BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'llama-3.3-70b-versatile',
                messages: [
                    {
                        role: 'system',
                        content: PORTFOLIO_CONTEXT
                    },
                    {
                        role: 'user',
                        content: userMessage
                    }
                ],
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const data = await response.json();
        return data.choices[0].message.content;
    } catch (error) {
        console.error('Error:', error);
        return "I apologize, but I'm having trouble connecting right now. Please try again in a moment.";
    }
}

// Handle send message
async function handleSendMessage() {
    const message = chatbotInput.value.trim();
    
    if (!message) return;
    
    // Add user message
    addMessage(message, true);
    chatbotInput.value = '';
    
    // Disable input while processing
    chatbotInput.disabled = true;
    sendButton.disabled = true;
    
    // Show typing indicator
    addTypingIndicator();
    
    // Get response from Groq
    const response = await sendToGroq(message);
    
    // Remove typing indicator and add bot response
    removeTypingIndicator();
    addMessage(response, false);
    
    // Re-enable input
    chatbotInput.disabled = false;
    sendButton.disabled = false;
    chatbotInput.focus();
}

// Event listeners
sendButton.addEventListener('click', handleSendMessage);

chatbotInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleSendMessage();
    }
});

// Handle suggestion buttons
suggestionButtons.forEach(button => {
    button.addEventListener('click', () => {
        chatbotInput.value = button.textContent;
        handleSendMessage();
    });
});
