const fs = require("fs");
const path = require("path");
const adminConfig = JSON.parse(fs.readFileSync("admin.json", "utf8"));

module.exports = {
    name: "help",
    usedby: 0,
    info: "hiện các lệnh có sẵn",
    dev: "Jonell Magallanes",
    onPrefix: true,
    usages: "help",
    cooldowns: 10,

    onLaunch: async function ({ api, event, target }) {
        const cmdsPath = path.join(__dirname, '');
        const commandFiles = fs.readdirSync(cmdsPath).filter(file => file.endsWith('.js'));

        const visibleCommandFiles = commandFiles.filter(file => {
            const command = require(path.join(cmdsPath, file));
            return !command.hide;
        });

        const commandsPerPage = 10;
        const totalPages = Math.ceil(visibleCommandFiles.length / commandsPerPage);

        let page = target[0] ? parseInt(target[0]) : 1;

        if (!isNaN(page)) {
            if (page <= 0 || page > totalPages) {
                return api.sendMessage(`Trang không tồn tại. Vui lòng chọn từ 1 đến ${totalPages}.`, event.threadID, event.messageID);
            }

            const startIndex = (page - 1) * commandsPerPage;
            const endIndex = Math.min(startIndex + commandsPerPage, visibleCommandFiles.length);

            let helpMessage = `╭─『 Danh Sách Lệnh 』\n`;
            const displayedCommands = visibleCommandFiles.slice(startIndex, endIndex);

            displayedCommands.forEach(file => {
                const commandInfo = require(path.join(cmdsPath, file));
                helpMessage += `│✧ ${commandInfo.name || "Không xác định"}\n`;
            });

            helpMessage += `╰───────────◊\n\n(Trang ${page}/${totalPages})\nGõ ${adminConfig.prefix}help <số trang> để xem thêm lệnh.\n\nDev: ${adminConfig.ownerName}`;

            return api.shareContact(helpMessage, api.getCurrentUserID(), event.threadID);
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
                    `│✧ Mô tả: ${commandInfo.info || "Không xác định"}\n` +
                    `│✧ Cần Prefix: ${commandInfo.onPrefix !== undefined ? commandInfo.onPrefix : "Không xác định"}\n` +
                    `╰───────────◊`;
                return api.shareContact(helpMessage, api.getCurrentUserID(), event.threadID);
            } else {
                return api.sendMessage(`Lệnh "${commandName}" không tồn tại.`, event.threadID);
            }
        }
    }
};
