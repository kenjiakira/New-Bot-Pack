const axios = require('axios');

let apiState = {
    useBackupApi: false
};

module.exports = {
    name: "ai",
    usedby: 0,
    dmUser: false,
    dev: "Jonell Magallanes",
    nickName: ["chatgpt", "gpt"],
    info: "Giáo dục",
    onPrefix: false,
    cooldowns: 6,
    
    onReply: async function ({ reply, api, event }) {
        const { threadID, senderID } = event;
        const mainApiUrl = `https://jonellprojectccapisexplorer.onrender.com/api/gptconvo?ask=${encodeURIComponent(reply)}&id=${senderID}`;
        const backupApiUrl = `https://gpt4o-hshs.onrender.com/gpt4o?ask=${encodeURIComponent(reply)}&id=${senderID}`;
        const apiUrl = apiState.useBackupApi ? backupApiUrl : mainApiUrl;

        api.setMessageReaction("⏱️", event.messageID, () => {}, true); 

        try {
            const response = await axios.get(apiUrl);
            const { response: followUpResult } = response.data;

            api.setMessageReaction("✅", event.messageID, () => {}, true);  
            api.sendMessage(`${followUpResult}`, threadID, event.messageID);

            if (apiState.useBackupApi && apiUrl === backupApiUrl) {
                apiState.useBackupApi = false; 
            }
        } catch (error) {
            console.error(error);

            if (!apiState.useBackupApi) {
                apiState.useBackupApi = true; 
                api.sendMessage("API chính gặp lỗi, chuyển sang API dự phòng.", threadID, event.messageID);
                return this.onReply({ reply, api, event });
            } else {
                api.sendMessage("Cả API chính và dự phòng đều gặp lỗi. Vui lòng thử lại sau.", threadID, event.messageID);
            }
        }
    },

    onLaunch: async function ({ event, actions, target, api }) {
        const { messageID, threadID } = event;
        const id = event.senderID;

        if (!target[0]) return api.sendMessage("Vui lòng nhập câu hỏi.\n\nVí dụ: ai Hệ Mặt Trời là gì?", threadID, messageID);

        const ask = encodeURIComponent(target.join(" "));
        const mainApiUrl = `https://jonellprojectccapisexplorer.onrender.com/api/gptconvo?ask=${ask}&id=${id}`;
        const backupApiUrl = `https://gpt4o-hshs.onrender.com/gpt4o?ask=${ask}&id=${id}`;
        const apiUrl = apiState.useBackupApi ? backupApiUrl : mainApiUrl;

        const lad = await actions.reply("🔎 Đang tìm câu trả lời, vui lòng chờ...", threadID, messageID);

        try {
            const response = await axios.get(apiUrl);
            const { response: result } = response.data;
            const responseMessage = `${result}`;

            api.editMessage(responseMessage, lad.messageID, threadID, messageID);

            global.client.onReply.push({
                name: this.name,
                messageID: lad.messageID,
                author: event.senderID,
            });

            if (apiState.useBackupApi && apiUrl === backupApiUrl) {
                apiState.useBackupApi = false
            }
        } catch (error) {
            console.error(error);

            if (!apiState.useBackupApi) {
                apiState.useBackupApi = true;  
                api.editMessage("API chính gặp lỗi, chuyển sang API dự phòng lỗi của " + error.message, lad.messageID, threadID, messageID);
                return this.onLaunch({ event, actions, target, api });
            } else {
                api.editMessage(`Cả API chính và dự phòng đều gặp lỗi: ${error}. Vui lòng thử lại sau.`, lad.messageID, threadID, messageID);
            }
        }
    }
};
