console.log('🚀 فایل script.js شروع به کار کرد');

// ===== اتصال به سرور =====
let socket;
try {
    socket = io({
        transports: ['websocket', 'polling'],
        path: '/socket.io/'
    });
    console.log('✅ تلاش برای اتصال به سرور...');
} catch (error) {
    console.error('❌ خطا در اتصال به سرور:', error);
    alert('مشکل در اتصال به سرور! لطفاً صفحه رو رفرش کن.');
}

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

// ===== بررسی اتصال Socket =====
if (socket) {
    socket.on('connect', () => {
        console.log('✅ به سرور متصل شدیم! Socket ID:', socket.id);
    });

    socket.on('connect_error', (error) => {
        console.error('❌ خطای اتصال به سرور:', error);
        alert('ارتباط با سرور قطع شد! لطفاً صفحه رو رفرش کن.');
    });

    socket.on('disconnect', () => {
        console.warn('⚠️ ارتباط با سرور قطع شد');
    });
} else {
    console.error('❌ Socket ایجاد نشد!');
}

// ===== ورود =====
joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') joinChat();
});

function joinChat() {
    const username = usernameInput.value.trim();
    console.log('📝 تلاش برای ورود با نام:', username);
    
    if (!username) {
        usernameInput.style.borderColor = '#ff4444';
        setTimeout(() => usernameInput.style.borderColor = '', 2000);
        return;
    }
    
    if (!socket) {
        alert('ارتباط با سرور برقرار نیست!');
        return;
    }
    
    currentUsername = username;
    socket.emit('user-joined', username);
    console.log('✅ رویداد user-joined ارسال شد');
    
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
    console.log('📜 تاریخچه دریافت شد:', history.length, 'پیام');
    history.forEach(msg => displayMessage(msg, msg.username === currentUsername));
});

// ===== پیام‌های جدید =====
socket.on('new-message', (data) => {
    console.log('💬 پیام جدید:', data);
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
    console.log('📤 پیام ارسال شد:', text);
    messageInput.value = '';
    messageInput.focus();
    stopTyping();
}

sendBtn.addEventListe
