const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ===== تنظیمات Socket.io برای Railway =====
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
        credentials: true
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling'],
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000
});

// ===== میدلور برای لاگ کردن درخواست‌ها =====
app.use((req, res, next) => {
    console.log(`📝 ${req.method} ${req.url}`);
    next();
});

// پوشه public رو در دسترس قرار بده
app.use(express.static(path.join(__dirname, 'public')));

// ===== روت اصلی برای اطمینان =====
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// لیست کاربران آنلاین
const users = {};
const messageHistory = [];
const MAX_HISTORY = 50;

// ===== لاگ کردن همه رویدادها برای دیباگ =====
io.on('connection', (socket) => {
    console.log('✅ کاربر جدید وصل شد:', socket.id);
    console.log('📊 تعداد کل کاربران:', Object.keys(users).length);

    // وقتی کاربر وارد می‌شه
    socket.on('user-joined', (username) => {
        console.log(`👤 کاربر "${username}" با Socket ID: ${socket.id} وارد شد`);
        
        users[socket.id] = username;
        
        // تاریخچه رو برای کاربر جدید بفرست
        socket.emit('message-history', messageHistory);
        console.log(`📜 تاریخچه (${messageHistory.length} پیام) برای ${username} ارسال شد`);
        
        // به همه بگو کاربر جدید اومده
        io.emit('user-joined', username);
        io.emit('online-users', Object.values(users));
        
        console.log(`👥 کاربران آنلاین:`, Object.values(users));
    });

    // وقتی کاربر پیام می‌فرسته
    socket.on('send-message', (data) => {
        const username = users[socket.id];
        if (!username) {
            console.log('⚠️ کاربر ناشناس سعی در ارسال پیام کرد');
            return;
        }
        
        const message = {
            id: Date.now(),
            username: username,
            text: data.text,
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };
        
        console.log(`💬 پیام از ${username}: "${data.text}"`);
        
        // ذخیره در تاریخچه
        messageHistory.push(message);
        if (messageHistory.length > MAX_HISTORY) {
            messageHistory.shift();
        }
        
        // پخش پیام به همه
        io.emit('new-message', message);
    });

    // وقتی کاربر تایپ می‌کنه
    socket.on('typing', (isTyping) => {
        const username = users[socket.id];
        if (username) {
            socket.broadcast.emit('user-typing', { username, isTyping });
        }
    });

    // وقتی کاربر قطع می‌کنه
    socket.on('disconnect', () => {
        const username = users[socket.id];
        if (username) {
            console.log(`👋 کاربر "${username}" قطع شد`);
            delete users[socket.id];
            io.emit('user-left', username);
            io.emit('online-users', Object.values(users));
        } else {
            console.log(`👋 کاربر ناشناس قطع شد: ${socket.id}`);
        }
    });
});

// ===== اجرای سرور =====
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 سرور اجرا شد روی پورت ${PORT}`);
    console.log(`📱 لینک: https://njr-chat-production.up.railway.app`);
