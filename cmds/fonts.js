module.exports = {
    name: "fonts",
    onPrefix: true,
    onLaunch: async function ({ api, event }) {
        const threadID = event.threadID;

        // Tạo các kiểu chữ khác nhau
        const boldMessage = global.fonts.bold("Xin chào, đây là chữ đậm!");
        const italicMessage = global.fonts.italic("Đây là chữ nghiêng.");
        const monospaceMessage = global.fonts.monospace("Văn bản kiểu monospace.");
        const boldItalicMessage = global.fonts.boldItalic("Văn bản chữ đậm và nghiêng.");

        // Gửi tin nhắn với các kiểu chữ đã tạo
        await api.sendMessage(`${boldMessage}\n${italicMessage}\n${monospaceMessage}\n${boldItalicMessage}`, threadID);
    }
};
