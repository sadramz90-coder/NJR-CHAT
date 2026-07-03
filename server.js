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
        methods: ["GET", "POST"]
    },
    path: '/socket.io/',
    transports: ['websocket', 'polling']  // اضافه کردن این خط برای اطمینان بیشتر
});

// پوشه public رو در دسترس قرار بده
app.use(express.static(path.join(__dirname, 'public')));

// لیست کاربران آنلاین
const users = {};
// تاریخچه پیام‌ها (حداکثر ۵۰ پیام آخر)
const messageHistory = [];
const MAX_HISTORY = 50;

io.on('connection', (socket) => {
    console.log('کاربر جدید وصل شد:', socket.id);

    // وقتی کاربر وارد می‌شه
    socket.on('user-joined', (username) => {
        users[socket.id] = username;
        // تاریخچه رو برای کاربر جدید بفرست
        socket.emit('message-history', messageHistory);
        // به همه بگو کاربر جدید اومده
        io.emit('user-joined', username);
        // لیست کاربران آنلاین رو به همه بفرست
        io.emit('online-users', Object.values(users));
    });

    // وقتی کاربر پیام می‌فرسته
    socket.on('send-message', (data) => {
        const message = {
            id: Date.now(),
            username: users[socket.id] || 'ناشناس',
            text: data.text,
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };
        
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
        delete users[socket.id];
        if (username) {
            io.emit('user-left', username);
            io.emit('online-users', Object.values(users));
        }
        console.log('کاربر قطع شد:', socket.id);
    });
});

// اجرای سرور
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 سرور اجرا شد روی http://localhost:${PORT}`);
    console.log(`📱 به دوستات بگو وارد بشن: http://localhost:${PORT}`);
});
