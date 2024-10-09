const fs = require("fs");
const path = require("path");
const adminConfig = JSON.parse(fs.readFileSync("admin.json", "utf8"));

module.exports = {
    name: "help",
    usedby: 0,
    info: "Hiển thị các lệnh có sẵn và thông tin chi tiết",
    dev: "Jonell Magallanes",
    onPrefix: true,
    usages: "help [số trang | all | tên lệnh]",
    cooldowns: 10,

    onLaunch: async function ({ api, event, target }) {
        const cmdsPath = path.join(__dirname, '');
        const commandFiles = fs.readdirSync(cmdsPath).filter(file => file.endsWith('.js'));

        // Lọc các lệnh không bị ẩn
        const visibleCommandFiles = commandFiles.filter(file => {
            const command = require(path.join(cmdsPath, file));
            return !command.hide;
        });

        // Nếu người dùng nhập "all", hiển thị toàn bộ danh sách lệnh
        if (target[0] === "all") {
            let allCommandsMessage = `╭─『 Danh Sách Toàn Bộ Lệnh 』\n`;
            visibleCommandFiles.forEach(file => {
                const commandInfo = require(path.join(cmdsPath, file));
                allCommandsMessage += `│✧ ${commandInfo.name || "Không xác định"} - ${commandInfo.info || "Không có mô tả"}\n`;
            });
            allCommandsMessage += `╰───────────◊\n\nGõ ${adminConfig.prefix}help <số trang> để xem thêm lệnh theo trang.\n\nDev: ${adminConfig.ownerName}`;
            return api.sendMessage(allCommandsMessage, event.threadID, event.messageID);
        }

        // Số lượng lệnh trên mỗi trang
        const commandsPerPage = 10;
        const totalPages = Math.ceil(visibleCommandFiles.length / commandsPerPage);
        
        let page = target[0] ? parseInt(target[0]) : 1;

        // Nếu người dùng nhập số trang
        if (!isNaN(page)) {
            if (page <= 0 || page > totalPages) {
                return api.sendMessage(`Trang không tồn tại. Vui lòng chọn từ 1 đến ${totalPages}.`, event.threadID, event.messageID);
            }

            const startIndex = (page - 1) * commandsPerPage;
            const endIndex = Math.min(startIndex + commandsPerPage, visibleCommandFiles.length);

            let helpMessage = `╭─『 Danh Sách Lệnh - Trang ${page}/${totalPages} 』\n`;
            const displayedCommands = visibleCommandFiles.slice(startIndex, endIndex);

            // Hiển thị tên lệnh và mô tả ngắn
            displayedCommands.forEach(file => {
                const commandInfo = require(path.join(cmdsPath, file));
                helpMessage += `│✧ ${commandInfo.name || "Không xác định"} - ${commandInfo.info || "Không có mô tả"}\n`;
            });

            helpMessage += `╰───────────◊\n\nGõ ${adminConfig.prefix}help <số trang> để xem thêm lệnh.\n\nDev: ${adminConfig.ownerName}`;
            return api.sendMessage(helpMessage, event.threadID, event.messageID);
        }

        if (target[0]) {
            const commandName = target[0];
            const commandFile = commandFiles.find(file => file === `${commandName}.js`);
            if (commandFile) {
                const commandInfo = require(path.join(cmdsPath, commandFile));

                const permissionText = commandInfo.usedby === undefined ? "Không xác định" :
                    commandInfo.usedby === 0 ? "Thành viên" :
                    commandInfo.usedby === 1 ? "Quản trị viên nhóm" :
                    commandInfo.usedby === 2 ? "Quản trị viên toàn cầu" :
                    commandInfo.usedby === 3 ? "Người điều hành" :
                    commandInfo.usedby === 4 ? "Quản trị viên và Người điều hành" : "Không xác định";

                const helpMessage = `╭─『 ${commandInfo.name || "Không xác định"} 』\n` +
                    `│✧ Tên: ${commandInfo.name || "Không xác định"}\n` +
                    `│✧ Quyền hạn: ${permissionText}\n` +
                    `│✧ Nhà phát triển: ${commandInfo.dev || "Không xác định"}\n` +
                    `│✧ Thời gian chờ: ${commandInfo.cooldowns || "Không xác định"} giây\n` +
                    `│✧ Mô tả: ${commandInfo.info || "Không có mô tả"}\n` +
                    `│✧ Cú pháp sử dụng: ${commandInfo.usages || "Không có cú pháp"}\n` +
                    `│✧ Cần Prefix: ${commandInfo.onPrefix !== undefined ? commandInfo.onPrefix : "Không xác định"}\n` +
                    `╰───────────◊`;
                return api.sendMessage(helpMessage, event.threadID, event.messageID);
            } else {
                return api.sendMessage(`Lệnh "${commandName}" không tồn tại.`, event.threadID, event.messageID);
            }
        }
    }
};
