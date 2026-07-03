console.log('✅ script.js لود شد');

// ===== اتصال به سرور =====
const socket = io({
    transports: ['websocket', 'polling'],
    path: '/socket.io/'
});

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

console.log('✅ المنت‌ها پیدا شدن:', {
    loginScreen: !!loginScreen,
    chatScreen: !!chatScreen,
    usernameInput: !!usernameInput,
    joinBtn: !!joinBtn
});

// ===== ورود (با دو روش مختلف برای اطمینان) =====

// روش ۱: با کلیک
joinBtn.addEventListener('click', function(e) {
    console.log('🖱️ دکمه ورود کلیک شد!');
    joinChat();
});

// روش ۲: با کلید Enter
usernameInput.addEventListener('keypress', function(e) {
    console.log('⌨️ کلید Enter زده شد!');
    if (e.key === 'Enter') {
        e.preventDefault();
        joinChat();
    }
});

// روش ۳: با لمس (برای موبایل)
joinBtn.addEventListener('touchstart', function(e) {
    console.log('📱 دکمه ورود لمس شد!');
    joinChat();
});

function joinChat() {
    console.log('📝 تابع joinChat اجرا شد');
    
    const username = usernameInput.value.trim();
    console.log('👤 نام کاربری:', username);
    
    if (!username) {
        console.log('⚠️ نام کاربری خالی است!');
        usernameInput.style.borderColor = '#ff4444';
        usernameInput.style.boxShadow = '0 0 20px rgba(255,0,0,0.3)';
        setTimeout(() => {
            usernameInput.style.borderColor = '';
            usernameInput.style.boxShadow = '';
        }, 2000);
        return;
    }
    
    console.log('✅ نام کاربری معتبر است');
    currentUsername = username;
    
    // ارسال به سرور
    socket.emit('user-joined', username);
    console.log('📤 رویداد user-joined ارسال شد');
    
    // تغییر صفحه
    console.log('🔄 تغییر صفحه از ورود به چت');
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    
    console.log('✅ صفحه چت نمایش داده شد');
    messageInput.focus();
    console.log('🎯 فوکوس روی ورودی پیام');
}

// ===== خروج =====
logoutBtn.addEventListener('click', function() {
    console.log('🚪 خروج از چت');
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
func
