const socket = io();

// ===== عناصر DOM =====
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const usersList = document.getElementById('users-list');
const onlineCount = document.getElementById('online-count');
const typingIndicator = document.getElementById('typing-indicator');
const logoutBtn = document.getElementById('logout-btn');

let currentUsername = '';
let isTyping = false;
let typingTimeout = null;

// ===== ورود =====
joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinChat();
});

function joinChat() {
    const username = usernameInput.value.trim();
    if (!username) {
        usernameInput.style.borderColor = '#ff4444';
        setTimeout(() => usernameInput.style.borderColor = '', 2000);
        return;
    }
    currentUsername = username;
    socket.emit('user-joined', username);
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    messageInput.focus();
}

// ===== خروج =====
logoutBtn.addEventListener('click', () => {
    location.reload();
});

// ===== دریافت تاریخچه =====
socket.on('message-history', (history) => {
    history.forEach(msg => displayMessage(msg, msg.username === currentUsername));
});

// ===== پیام‌های جدید =====
socket.on('new-message', (data) => {
    displayMessage(data, data.username === currentUsername);
    scrollToBottom();
});

function displayMessage(data, isOwn) {
    const div = document.createElement('div');
    div.className = `message ${isOwn ? 'own' : 'other'}`;
    div.innerHTML = `
        <span class="msg-username">${isOwn ? 'شما' : data.username}</span>
        <span class="msg-text">${escapeHtml(data.text)}</span>
        <span class="msg-time">${data.time}</span>
    `;
    messagesContainer.appendChild(div);
}

// ===== ارسال پیام =====
function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    
    socket.emit('send-message', { text });
    messageInput.value = '';
    messageInput.focus();
    stopTyping();
}

sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        sendMessage();
    }
});

// ===== تایپ‌ایندیکیتور =====
messageInput.addEventListener('input', () => {
    if (!isTyping) {
        isTyping = true;
        socket.emit('typing', true);
    }
    clearTimeout(typingTimeout);
    typingTimeout = setTimeout(stopTyping, 1500);
});

function stopTyping() {
    if (isTyping) {
        isTyping = false;
        socket.emit('typing', false);
    }
}

socket.on('user-typing', ({ username, isTyping }) => {
    if (isTyping) {
        typingIndicator.textContent = `${username} در حال تایپ است...`;
    } else {
        typingIndicator.textContent = '';
    }
});

// ===== کاربران آنلاین =====
socket.on('online-users', (users) => {
    usersList.innerHTML = users.map(user => `
        <span class="user-chip">
            <span class="online-dot"></span>
            ${escapeHtml(user)}
        </span>
    `).join('');
    onlineCount.textContent = `${users.length} آنلاین`;
});

socket.on('user-joined', (username) => {
    addSystemMessage(`${username} وارد شد 🎉`);
});

socket.on('user-left', (username) => {
    addSystemMessage(`${username} خارج شد 👋`);
});

function addSystemMessage(text) {
    const div = document.createElement('div');
    div.style.cssText = `
        text-align: center;
        color: #999;
        font-size: 13px;
      
