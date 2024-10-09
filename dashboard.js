const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const fs = require('fs');
const path = require('path');
const os = require('os');
const session = require('express-session');
const { spawn } = require('child_process');
const app = express();
const server = http.createServer(app);
const io = socketIo(server);
const adminConfig = JSON.parse(fs.readFileSync("admin.json", "utf8"));
const PORT = process.env.PORT || 8080;
const chalk = require("chalk");
const boldText = (text) => chalk.bold(text);
const gradient = require("gradient-string");

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const username = adminConfig.loginpanel.user;
const password = adminConfig.loginpanel.password;
const restartPasscode = adminConfig.loginpanel.passcode;

app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));

function getBotInfo() {
    return {
        botName: adminConfig.botName || "MyBot", // Tên bot
        prefix: adminConfig.prefix || "!", // Tiền tố lệnh
        ownerName: adminConfig.ownerName || "Jonell Magallanes", // Tên chủ sở hữu
        commandsCount: fs.readdirSync('./cmds').length, // Số lượng lệnh
        eventsCount: fs.readdirSync('./events').length, // Số sự kiện
        threadsCount: Object.keys(JSON.parse(fs.readFileSync('./database/threads.json', 'utf8') || "{}")).length, // Số lượng nhóm
        usersCount: Object.keys(JSON.parse(fs.readFileSync('./database/users.json', 'utf8') || "{}")).length, // Số lượng người dùng
        uptime: `${Math.floor(process.uptime())} giây`, // Thời gian hoạt động
        os: `${os.type()} ${os.release()} (${os.platform()})`, // Thông tin hệ điều hành
        hostname: os.hostname(), // Tên máy chủ
        responseTime: `${responseLatency}ms` // Thời gian phản hồi
    };
}

let responseLatency = 0;

io.on('connection', (socket) => {
    socket.emit('updateStats', getBotInfo()); // Gửi thông tin bot

    socket.on('restartBot', (inputPasscode) => {
        if (inputPasscode === restartPasscode) {
            socket.emit('restartSuccess', 'Khởi động lại thành công!'); // Thông báo thành công
        } else {
            socket.emit('restartFailed', 'Mã không chính xác. Vui lòng thử lại.'); // Thông báo lỗi mã
        }
    });

    socket.on('executeCommand', (command) => {
        const commandParts = command.split(' ');
        const cmd = commandParts[0];
        const args = commandParts.slice(1);

        const processCommand = spawn(cmd, args, { shell: true });
        const startTime = Date.now();

        processCommand.stdout.on('data', (data) => {
            const elapsedTime = Date.now() - startTime;
            socket.emit('commandOutput', { output: `$Hutchin-bot ~: ${data}`, color: 'green' }); // Xuất lệnh thành công
        });

        processCommand.stderr.on('data', (data) => {
            const elapsedTime = Date.now() - startTime;
            socket.emit('commandOutput', { output: `$Hutchin-bot ~: Lỗi: ${data} (Thời gian phản hồi: ${elapsedTime} ms)`, color: 'red' }); // Xuất lỗi
        });

        processCommand.on('close', (code) => {
            const elapsedTime = Date.now() - startTime;
            socket.emit('commandOutput', { output: `$Hutchin-bot ~: Lệnh kết thúc với mã ${code} (Thời gian phản hồi: ${elapsedTime} ms)`, color: 'blue' }); // Xuất khi kết thúc
        });
    });

    socket.on('exitConsole', () => {
        socket.emit('commandOutput', { output: 'Đang thoát khỏi bảng điều khiển...', color: 'blue' });
        socket.emit('redirectHome');
        socket.disconnect();
    });

    setInterval(() => {
        const start = Date.now();
        io.emit('updateStats', getBotInfo()); // Cập nhật thông tin bot mỗi giây
        responseLatency = Date.now() - start;
    }, 1000);
});

app.post('/login', (req, res) => {
    const { username: inputUsername, password: inputPassword } = req.body;

    if (username === inputUsername && password === inputPassword) {
        req.session.loggedin = true;
        res.redirect('/console'); // Đăng nhập thành công
    } else {
        res.redirect('/login.html?error=Unauthorized'); // Đăng nhập thất bại
    }
});

function checkAuth(req, res, next) {
    if (req.session.loggedin) {
        next();
    } else {
        res.redirect('/login.html'); // Kiểm tra xác thực
    }
}

app.get('/console', checkAuth, (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', '3028.html')); // Điều hướng tới bảng điều khiển
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'dashboard', 'login.html')); // Điều hướng tới trang đăng nhập
});

server.listen(PORT, () => {
    console.error(boldText(gradient.cristal(`[ Đang triển khai máy chủ bot tại cổng: ${PORT} ]`))); // In ra cổng triển khai
});
