const fs = require('fs');

module.exports = {
    name: "module",
    usedby: 2,
    info: "Cài đặt, gỡ cài đặt, chia sẻ hoặc tải lại các mô-đun lệnh",
    dmUser: false,
    onPrefix: true,
    dev: "Jonell Magallanes",
    cooldowns: 5,

    onLaunch: async function ({ api, event, target }) {
        const threadID = event.threadID;
        const commandName = target[1];
        const commandCode = target.slice(2).join(' ');

        if (target[0] === "install" && commandName) {
            const confirmationMessage = `⚠️ 𝗖𝗼𝗻𝗳𝗶𝗿𝗺 𝗖𝗮̀𝗶 𝗱𝗮̣̆𝘁\n${global.line}\nBạn có muốn cài đặt lệnh "${commandName}" với mã được cung cấp không? Phản ứng (👍) để xác nhận hoặc (👎) để hủy bỏ.`;
            const sentMessage = await api.sendMessage(confirmationMessage, threadID, event.messageID);

            global.client.callReact.push({
                name: this.name,
                messageID: sentMessage.messageID,
                commandName: commandName,
                action: 'install',
                commandCode: commandCode
            });
        } else if (target[0] === "uninstall" && commandName) {
            const filePath = `./cmds/${commandName}.js`;

            if (fs.existsSync(filePath)) {
                const confirmationMessage = `⚠️ 𝗖𝗼𝗻𝗳𝗶𝗿𝗺 𝗚𝗨𝗼𝗿 𝗰𝗮̀𝗶 𝗱𝗮̣̆𝘁\n${global.line}\nBạn có muốn gỡ cài đặt lệnh "${commandName}" không? Phản ứng (👍) để xác nhận hoặc (👎) để hủy bỏ.`;
                const sentMessage = await api.sendMessage(confirmationMessage, threadID, event.messageID);

                global.client.callReact.push({
                    name: this.name,
                    messageID: sentMessage.messageID,
                    commandName: commandName,
                    action: 'uninstall'
                });
            } else {
                await api.sendMessage(`❌ Lệnh ${commandName} không tồn tại.`, threadID);
            }
        } else if (target[0] === "share" && commandName) {
            const filePath = `./cmds/${commandName}.js`;

            if (fs.existsSync(filePath)) {
                const commandCode = fs.readFileSync(filePath, 'utf-8');
                const shareMessage = await api.sendMessage("Đang trích xuất mã lệnh...", threadID, event.messageID);
                await api.editMessage(`${commandName}.js\n\n${commandCode}`, shareMessage.messageID, threadID);
            } else {
                await api.sendMessage(`❌ Lệnh ${commandName} không tồn tại.`, threadID);
            }
        } else if (target[0] === "reload" && commandName) {
            const reloadStatus = global.cc.reload[commandName];

            if (reloadStatus) {
                await api.sendMessage(`✅ 𝗠𝗼𝗱𝘂𝗹𝗲 𝗖𝗮̀𝗶 𝗱𝗮̣̆𝘁\n${global.line}\nLệnh "${commandName}" đã được tải lại thành công.`, threadID);
            } else {
                await api.sendMessage(`❌ Không thể tải lại lệnh "${commandName}".`, threadID);
            }
        } else {
            await api.sendMessage("Cách sử dụng: -module [install|uninstall|share|reload] [tên lệnh] [tùy chọn: mã lệnh]", threadID);
        }
    },

    callReact: async function ({ reaction, event, api }) {
        const { threadID, messageID } = event;
        const reactData = global.client.callReact.find(item => item.messageID === messageID);

        if (!reactData) return;

        const { commandName, action, commandCode, messageID: sentMessageID } = reactData;
        await api.unsendMessage(sentMessageID);

        if (reaction === '👍') {
            if (action === 'install') {
                const checkMessage = await api.sendMessage(`🔍 Đang xác minh lệnh....`, threadID, event.messageID);
                await new Promise(resolve => setTimeout(resolve, 5000));

                try {
                    new Function(commandCode);
                    const filePath = `./cmds/${commandName}.js`;
                    fs.writeFileSync(filePath, commandCode);
                    await api.editMessage(`✅ 𝗠𝗼𝗱𝘂𝗹𝗲 𝗖𝗮̀𝗶 𝗱𝗮̣̆𝘁\n${global.line}\nLệnh "${commandName}" đã được cài đặt thành công.`, checkMessage.messageID, threadID, event.messageID);
                    global.cc.reload[commandName];
                } catch (error) {
                    await api.editMessage(`❌ Không thể cài đặt lệnh. Lỗi: ${error.message}`, checkMessage.messageID, threadID);
                }
            } else if (action === 'uninstall') {
                const filePath = `./cmds/${commandName}.js`;

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    await api.sendMessage(`✅ 𝗠𝗼𝗱𝘂𝗹𝗲 𝗚𝗨𝗼𝗿 𝗰𝗮̀𝗶 𝗱𝗮̣̆𝘁\n${global.line}\nLệnh "${commandName}" đã được gỡ cài đặt thành công.`, threadID, event.messageID);
                } else {
                    await api.sendMessage(`❌ Lệnh "${commandName}" không tồn tại.`, threadID);
                }
            }
        } else if (reaction === '👎') {
            await api.sendMessage(`❌ 𝗠𝗼𝗱𝘂𝗹𝗲𝘀 𝗖𝗮𝗻𝗰𝗲𝗹𝗹𝗲𝗱\n${global.line}\nHành động cho lệnh "${commandName}" đã bị hủy bỏ.`, threadID);
        }
    }
};
