import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "AIzaSyAFUr_D886zrw8iP3fJyV29af5XgjoWTPQ"; // Replace with your API key

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function parseMarkdownToHTML(text) {
    const lines = text.split('\n');
    const container = document.createElement('div');
    let insideCodeBlock = false;
    let codeLines = [];

    lines.forEach(line => {
        if (line.trim().startsWith('```')) {
            insideCodeBlock = !insideCodeBlock;
            if (!insideCodeBlock) {
                const codeElement = document.createElement('pre');
                codeElement.innerHTML = codeLines.join('\n');
                container.appendChild(codeElement);
                codeLines = [];
            }
        } else if (insideCodeBlock) {
            codeLines.push(line);
        } else {
            const paragraph = document.createElement('p');
            const htmlContent = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
            paragraph.innerHTML = htmlContent;
            container.appendChild(paragraph);
        }
    });

    if (codeLines.length > 0) {
        const codeElement = document.createElement('pre');
        codeElement.innerHTML = codeLines.join('\n');
        container.appendChild(codeElement);
    }

    return container;
}

async function sendMessage() {
    const promptInput = document.getElementById('prompt');
    const prompt = promptInput.value;
    if (!prompt) return;

    const messagesContainer = document.getElementById('messages');
    const userMessage = document.createElement('div');
    userMessage.className = 'message user';
    userMessage.innerHTML = `<i class="fas fa-user"></i><div class="text">${prompt}</div>`;
    messagesContainer.appendChild(userMessage);

    const botTypingMessage = document.createElement('div');
    botTypingMessage.className = 'message bot typing';
    botTypingMessage.innerHTML = `<i class="fas fa-robot"></i><div class="text"><i class="fas fa-spinner fa-spin"></i> Typing...</div>`;
    messagesContainer.appendChild(botTypingMessage);

    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();

    messagesContainer.removeChild(botTypingMessage);

    const botMessage = document.createElement('div');
    botMessage.className = 'message bot';
    const formattedText = parseMarkdownToHTML(text);
    botMessage.innerHTML = `<i class="fas fa-robot"></i><div class="text"></div>`;
    botMessage.querySelector('.text').appendChild(formattedText);
    messagesContainer.appendChild(botMessage);

    promptInput.value = '';
    messagesContainer.scrollTop = messagesContainer.scrollHeight; // Scroll to the bottom
}

document.getElementById('sendButton').addEventListener('click', sendMessage);

document.getElementById('prompt').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});