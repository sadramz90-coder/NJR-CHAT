const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);

// ===== تنظیمات ساده Socket.io =====
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// پوشه public رو در دسترس قرار بده
app.use(express.static(path.join(__dirname, 'public')));

// لیست کاربران آنلاین
const users = {};
const messageHistory = [];
const MAX_HISTORY = 50;

io.on('connection', (socket) => {
    console.log('کاربر جدید وصل شد:', socket.id);

    socket.on('user-joined', (username) => {
        users[socket.id] = username;
        socket.emit('message-history', messageHistory);
        io.emit('user-joined', username);
        io.emit('online-users', Object.values(users));
    });

    socket.on('send-message', (data) => {
        const message = {
            id: Date.now(),
            username: users[socket.id] || 'ناشناس',
            text: data.text,
            time: new Date().toLocaleTimeString('fa-IR', { hour: '2-digit', minute: '2-digit' }),
            timestamp: Date.now()
        };
        
        messageHistory.push(message);
        if (messageHistory.length > MAX_HISTORY) {
            messageHistory.shift();
        }
        
        io.emit('new-message', message);
    });

    socket.on('typing', (isTyping) => {
        const username = users[socket.id];
        if (username) {
            socket.broadcast.emit('user-typing', { username, isTyping });
        }
    });

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

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 سرور اجرا شد روی پورت ${PORT}`);
});
