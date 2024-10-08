const fs = require('fs');

module.exports = {
    name: "changeprefix",
    usedby: 4,
    info: "Thay đổi tiền tố lệnh của bot",
    dev: "Jonell Magallanes",
    usages: "changeprefix <tiền tố mới>",
    onPrefix: true,
    cooldowns: 20,

    onLaunch: async function ({ api, event, target }) {
        const threadID = event.threadID;
        const newPrefix = target.join(" ").trim();

        if (!newPrefix) {
            return api.sendMessage("Vui lòng cung cấp một tiền tố mới. Cách sử dụng: -changeprefix [tiền tố mới]", threadID);
        }

        const confirmationMessage = `❓ 𝗖𝗵𝗮𝗻𝗴𝗲 𝗣𝗿𝗲𝗳𝗶𝘅 𝗖𝗼𝗻𝗳𝗶𝗿𝗺𝗮𝘁𝗶𝗼𝗻\n${global.line}\nVui lòng phản ứng với tin nhắn này (👍) để xác nhận thay đổi tiền tố thành '${newPrefix}' hoặc phản ứng (👎) để hủy bỏ.`;

        const threadIDPath = './database/prefix/threadID.json';
        const data = { threadID: threadID };

        fs.writeFile(threadIDPath, JSON.stringify(data, null, 2), (err) => {
            if (err) {
                console.error("Lỗi khi lưu threadID:", err);
            }
        });

        const sentMessage = await api.sendMessage(confirmationMessage, threadID);

        global.client.callReact.push({
            name: this.name,
            messageID: sentMessage.messageID,
            newPrefix: newPrefix
        });
    },

    callReact: async function ({ reaction, event, api }) {
        const { threadID, messageID } = event;
        const reactData = global.client.callReact.find(item => item.messageID === messageID);

        if (!reactData) return;

        const adminConfigPath = "./admin.json";

        if (reaction === '👍') {
            try {
                const adminConfig = JSON.parse(fs.readFileSync(adminConfigPath, 'utf8'));
                adminConfig.prefix = reactData.newPrefix;

                fs.writeFile(adminConfigPath, JSON.stringify(adminConfig, null, 2), (err) => {
                    if (err) {
                        return api.sendMessage("Lỗi khi lưu tiền tố mới, vui lòng thử lại.", threadID);
                    }

                    api.sendMessage(`🔄 𝗖𝗵𝗮𝗻𝗴𝗶𝗻𝗴 𝗽𝗿𝗲𝗳𝗶𝘅 𝘁𝗼 '${reactData.newPrefix}'\n${global.line}\nVui lòng chờ...`, threadID, () => {
                        api.unsendMessage(messageID);
                        setTimeout(() => process.exit(1), 2000);
                    });
                });
            } catch (err) {
                api.sendMessage("Lỗi khi thay đổi tiền tố, vui lòng thử lại.", threadID);
            }
        } else if (reaction === '👎') {
            api.sendMessage("❌ 𝗖𝗵𝗮𝗻𝗴𝗲 𝗣𝗿𝗲𝗳𝗶𝘅 𝗖𝗮𝗻𝗰𝗲𝗹𝗹𝗲𝗱", threadID, () => {
                api.unsendMessage(messageID); 
            });
        }

        global.client.callReact = global.client.callReact.filter(item => item.messageID !== messageID);
    }
};
