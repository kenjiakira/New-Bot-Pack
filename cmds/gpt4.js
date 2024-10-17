const axios = require('axios');

module.exports = {
    name: "gpt4",
    usedby: 0,
    dev: "Jonell Magallanes",
    info: "Giáo dục",
    onPrefix: false,
    dmUser: false, 
    nickName: ["4o"],
    cooldowns: 6,

    onReply: async function ({ reply, api, event }) {
        const { threadID } = event;
        const followUpApiUrl = `https://gpt4o-hshs.onrender.com/gpt4o?ask=${encodeURIComponent(reply)}&id=${event.senderID}`;
        api.setMessageReaction("⏱️", event.messageID, () => {}, true);  

        try {
            const response = await axios.get(followUpApiUrl);
            if (response.data.status) {
                const followUpResult = response.data.response;
                api.setMessageReaction("✅", event.messageID, () => {}, true);  
                api.sendMessage(`${followUpResult}`, threadID);
            } else {
                api.setMessageReaction("❌", event.messageID, () => {}, true);  
                api.sendMessage("Không nhận được phản hồi hợp lệ từ AI.", threadID);
            }
        } catch (error) {
            console.error(error);
            api.sendMessage(`Lỗi: ${error.message}`, threadID);  
        }
    },

    onLaunch: async function ({ event, target, api }) {
        const { messageID, threadID } = event;
        const id = event.senderID;

        if (!target[0]) return api.sendMessage("Vui lòng đặt câu hỏi.\n\nVí dụ: gpt4o Hệ mặt trời là gì?", threadID, messageID);

        const ask = target.join(" ");
        const apiUrl = `https://gpt4o-hshs.onrender.com/gpt4o?ask=${encodeURIComponent(ask)}&id=${id}`;
        const haha = await api.sendMessage("🔎 Đang tìm câu trả lời, vui lòng chờ...", threadID, messageID);

        try {
            const response = await axios.get(apiUrl);
            if (response.data.status) {
                const bold = global.fonts.bold("GPT4 AI: ")
                const result = response.data.response;
                api.editMessage(`${bold}${result}`, haha.messageID, threadID, event.messageID);

                global.client.onReply.push({
                    name: this.name,
                    messageID: messageID,
                    author: event.senderID,
                });
            } else {
                api.editMessage("Lỗi: Không nhận được phản hồi từ máy chủ.", haha.messageID, threadID, messageID);
            }
        } catch (error) {
            console.error(error);
            api.editMessage(`Lỗi: ${error.message}`, haha.messageID, threadID, messageID);
        }
    }
};
