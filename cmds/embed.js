const axios = require('axios');

module.exports = {
    name: "embed",
    usedby: 0,
    info: "Nhúng URL hoặc tìm kiếm các tệp nhúng",
    onPrefix: true,
    dev: "Jonell Magallanes",
    cooldowns: 6,

    onLaunch: async function ({ api, event, target }) {
        const commandType = target[0];

        if (commandType === "search") {
            const searchTerm = target.slice(1).join(' ');

            if (!searchTerm) {
                return api.sendMessage("Vui lòng cung cấp một từ khóa tìm kiếm.", event.threadID);
            }

            const hs = await api.sendMessage("Đang nhúng.....", event.threadID, event.messageID);
            try {
                const response = await axios.get(`https://ccprojectprivilege.adaptable.app/embed/search?search=${encodeURIComponent(searchTerm)}`);
                const files = response.data.files;

                if (response.data.success && files.length > 0) {
                    const filePaths = files.map(file => `https://ccprojectprivilege.adaptable.app/${file}.html`).join('\n');
                    api.editMessage(`𝗘𝗺𝗯𝗲𝗱𝗱𝗲𝗱 𝗖𝗖 𝗣𝗥𝗢𝗝𝗘𝗖𝗧𝗦 𝗦𝗲𝗮𝗿𝗰𝗵\n━━━━━━━━━━━━━━━━━━\nKết quả tìm kiếm\n${filePaths}`, hs.messageID, event.threadID);
                } else {
                    api.editMessage("Không tìm thấy tệp nào cho từ khóa tìm kiếm đã cho.", hs.messageID, event.threadID);
                }
            } catch (error) {
                api.editMessage(`Lỗi: ${error.message}`, hs.messageID, event.threadID);
            }

        } else {
            const input = target.join(' ');
            const [urlToEmbed, nameTitle] = input.split('|').map(part => part.trim());

            if (!urlToEmbed || !nameTitle) {
                return api.sendMessage("Vui lòng cung cấp một URL hợp lệ và tên, phân tách bằng '|'.", event.threadID);
            }

            const hs = await api.sendMessage("Đang nhúng.....", event.threadID, event.messageID);
            try {
                const response = await axios.get(`https://ccprojectprivilege.adaptable.app/embed?url=${encodeURIComponent(urlToEmbed)}&name=${encodeURIComponent(nameTitle)}`);
                const filePath = response.data.filePath;

                if (response.data.success) {
                    api.editMessage(`𝗘𝗺𝗯𝗲𝗱𝗱𝗲𝗱 𝗦𝘂𝗰𝗰𝗲𝘀𝘀𝗳𝘂𝗹𝗹𝘆\n━━━━━━━━━━━━━━━━━━\nNhúng thành công!\n🌐 URL đã được nhúng: ${filePath}`, hs.messageID, event.threadID, event.messageID);
                } else {
                    api.sendMessage("Nhúng URL không thành công.", event.threadID);
                }
            } catch (error) {
                api.editMessage(`Lỗi: ${error.message}`, hs.messageID, event.threadID);
            }
        }
    }
};
