const axios = require('axios');

module.exports = {
    name: "monitor",
    usedby: 0,
    info: "Theo dõi thời gian hoạt động của website, tìm kiếm các URL đã được theo dõi và liệt kê tất cả các URL đã được theo dõi",
    onPrefix: true,
    dev: "Jonell Magallanes",
    cooldowns: 6,
    nickName: ["moni"],

    onLaunch: async function ({ api, event, target }) {
        const baseUrl = "https://ccprojectprivilege.adaptable.app";

        if (!target[0]) {
            return api.sendMessage("Vui lòng chỉ định một lệnh: `add`, `list`, hoặc `search`.", event.threadID, event.messageID);
        }
        const wha = await api.sendMessage("Đang tải.....", event.threadID, event.messageID);
        const command = target[0];
        const urlOrSearch = target[1];

        if (command === 'add') {
            if (!urlOrSearch) {
                return api.sendMessage("Vui lòng cung cấp một URL để thêm vào danh sách theo dõi.", event.threadID, event.messageID);
            }

            try {
                const response = await axios.get(`${baseUrl}/uptime?url=${encodeURIComponent(urlOrSearch)}`);
                const data = response.data;

                if (data.message === "Website added successfully") {
                    api.editMessage(`𝗠𝗼𝗻𝗶𝘁𝗼𝗿𝗲𝗱 𝗨𝗿𝗹 𝗔𝗱𝗱𝗲𝗱\n━━━━━━━━━━━━━━━━━━\nĐã thêm thành công theo dõi cho URL: ${data.url}`, wha.messageID, event.threadID, event.messageID);
                } else if (data.message === "URL is already in the list") {
                    api.editMessage(`𝗔𝗹𝗿𝗲𝗮𝗱𝘆 𝗨𝗽𝘁𝗶𝗺𝗲𝗱 𝗨𝗥𝗟\n━━━━━━━━━━━━━━━━━━\nURL đã tồn tại trong cơ sở dữ liệu: ${data.url}`, wha.messageID, event.threadID, event.messageID);
                } else {
                    api.editMessage("Phản hồi không xác định từ máy chủ.", wha.messageID, event.threadID, event.messageID);
                }
            } catch (error) {
                api.sendMessage("Lỗi khi thêm theo dõi.", event.threadID, event.messageID);
            }
        } else if (command === 'search') {
            if (!urlOrSearch) {
                return api.sendMessage("Vui lòng cung cấp một URL để tìm kiếm trong danh sách theo dõi.", event.threadID, event.messageID);
            }

            try {
                const response = await axios.get(`${baseUrl}/search?url=${encodeURIComponent(urlOrSearch)}`);
                const data = response.data;

                if (data.length === 0) {
                    return api.editMessage(`Không tìm thấy kết quả cho: ${urlOrSearch}`, wha.messageID, event.threadID, event.messageID);
                }

                let message = `𝗦𝗲𝗮𝗿𝗰𝗵 𝗨𝗿𝗹 𝗠𝗼𝗻𝗶𝘁𝗼𝗿𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n🔍 Tìm kiếm:${urlOrSearch}\n`;
                data.forEach(item => {
                    const status = interpretStatus(item.status);
                    message += `🌐 URL: ${item.url}\n📝 Trạng thái: ${status}\nThời gian: ${item.duration}ms\n⏱️ Cuối cùng kiểm tra: ${new Date(item.lastChecked)}\n━━━━━━━━━━━━━━━━━━\n`;
                });

                api.editMessage(message, wha.messageID, event.threadID, event.messageID);
            } catch (error) {
                api.sendMessage("Lỗi khi tìm kiếm URL.", event.threadID, event.messageID);
            }
        } else if (command === 'list') {
            try {
                const response = await axios.get(`${baseUrl}/list`);
                const data = response.data;

                let message = "𝗠𝗼𝗻𝗶𝘁𝗼𝗿 𝗨𝗽𝘁𝗶𝗺𝗲𝗱 𝗟𝗶𝘀𝘁\n━━━━━━━━━━━━━━━━━━\n";
                data.forEach(item => {
                    const status = interpretStatus(item.status);
                    message += `🌐 URL: ${item.url}\n📝 Trạng thái: ${status}\nThời gian: ${item.duration}ms\n⏱️ Cuối cùng kiểm tra: ${new Date(item.lastChecked)}\n━━━━━━━━━━━━━━━━━━\n`;
                });

                api.editMessage(message, wha.messageID, event.threadID, event.messageID);
            } catch (error) {
                api.sendMessage("Lỗi khi lấy danh sách theo dõi.", event.threadID, event.messageID);
            }
        } else {
            api.sendMessage("Lệnh không hợp lệ. Sử dụng `add`, `list`, hoặc `search`.", event.threadID, event.messageID);
        }
    }
}

function interpretStatus(statusEmoji) {
    switch (statusEmoji) {
        case '🔵':
            return "Đang hoạt động (200 OK)";
        case '⚫':
            return "Cấm hoặc Cổng xấu";
        case '🔴':
            return "Ngừng hoạt động";
        default:
            return "Trạng thái không xác định";
    }
}
