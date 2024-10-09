const axios = require('axios');

module.exports = {
    name: "ai2",
    usedby: 0,
    dev: "Jonell Magallanes",
    info: "AI Gemini",
    onPrefix: false,
    cooldowns: 6,

    onReply: async function ({ reply, api, event }) {
        const { threadID } = event;
        const followUpApiUrl = `https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(reply)}`;
        api.setMessageReaction("⏱️", event.messageID, () => {}, true);        
        try {
            const response = await axios.get(followUpApiUrl);
            const followUpResult = response.data.reply;
            api.setMessageReaction("✅", event.messageID, () => {}, true);
            api.sendMessage(`${followUpResult}`, threadID);
        } catch (error) {
            console.error(error);
            api.sendMessage(error.message, threadID);
        }
    },

    onLaunch: async function ({ event, target, api }) {
        const { messageID, threadID } = event;
        const id = event.senderID;

        if (!target[0]) return api.sendMessage("Vui lòng cung cấp câu hỏi của bạn.\n\nVí dụ: ai hệ mặt trời là gì?", threadID, messageID);

        const apiUrl = `https://hercai.onrender.com/v3/hercai?question=${encodeURIComponent(target.join(" "))}`;
       const haha = await api.sendMessage("🔎 Tìm kiếm câu trả lời. Hãy chờ...", threadID, messageID);

        try {
            const response = await axios.get(apiUrl);
            const result = response.data.reply;
            api.editMessage(`${result}`, haha.messageID, threadID, event.messageID);

            global.client.onReply.push({
                name: this.name,
                messageID: messageID,
                author: event.senderID,
            });

        } catch (error) {
            console.error(error);
            api.editMessage(error.message, haha.messageID, threadID, messageID);
        }
    }
};
