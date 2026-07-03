console.log('🚀 script.js شروع شد');

// ===== اتصال به سرور =====
const socket = io({
    transports: ['websocket', 'polling'],
    path: '/socket.io/'
});

console.log('📡 در حال اتصال به سرور...');

// ===== المنت‌ها =====
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const usernameInput = document.getElementById('username-input');
const joinBtn = document.getElementById('join-btn');
const messageInput = document.getElementById('message-input');
const sendBtn = document.getElementById('send-btn');
const messagesContainer = document.getElementById('messages');
const usersList = document.getElementById('users-list');
const onlineCount = document.getElementById('online-count');

let currentUsername = '';

// ===== رویدادهای Socket =====
socket.on('connect', () => {
    console.log('✅ به سرور متصل شدیم! ID:', socket.id);
});

socket.on('connect_error', (error) => {
    console.error('❌ خطای اتصال:', error);
});

socket.on('message-history', (history) => {
    console.log('📜 تاریخچه دریافت شد:', history.length, 'پیام');
    history.forEach(msg => {
        const div = document.createElement('div');
        div.textContent = `${msg.username}: ${msg.text}`;
        messagesContainer.appendChild(div);
    });
});

socket.on('new-message', (data) => {
    console.log('💬 پیام جدید:', data);
    const div = document.createElement('div');
    div.textContent = `${data.username}: ${data.text} (${data.time})`;
    messagesContainer.appendChild(div);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
});

socket.on('online-users', (users) => {
    console.log('👥 لیست کاربران آنلاین:', users);
    usersList.innerHTML = users.map(user => `<span>👤 ${user}</span>`).join('');
    onlineCount.textContent = `${users.length} آنلاین`;
});

socket.on('user-joined', (username) => {
    console.log('➕ کاربر جدید:', username);
    const div = document.createElement('div');
    div.textContent = `✨ ${username} وارد شد`;
    messagesContainer.appendChild(div);
});

socket.on('user-left', (username) => {
    console.log('➖ کاربر خارج شد:', username);
    const div = document.createElement('div');
    div.textContent = `👋 ${username} خارج شد`;
    messagesContainer.appendChild(div);
});

// ===== ورود =====
joinBtn.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    if (!username) return;
    
    currentUsername = username;
    console.log('📝 ارسال user-joined:', username);
    socket.emit('user-joined', username);
    
    loginScreen.style.display = 'none';
    chatScreen.style.display = 'flex';
    messageInput.focus();
});

// ===== ارسال پیام =====
sendBtn.addEventListener('click', sendMessage);
messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendMessage();
});

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;
    
    console.log('📤 ارسال پیام:', text);
    socket.emit('send-message', { text });
    messageInput.value = '';
}

console.log('✅ script.js آماده است');
