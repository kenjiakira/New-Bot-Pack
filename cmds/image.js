const axios = require("axios");
const path = require("path");
const fs = require("fs-extra");

module.exports = {
    name: "image",
    version: "1.0",
    usedby: 0,
    info: "Tìm kiếm hình ảnh từ Pinterest",
    dev: "Jonell Magallanes",
    onPrefix: false,
    usages: "[query]",
    cooldowns: 5,

    onLaunch: async function ({ api, event, target }) {
        try {
            const keySearch = target.join(" ");

            if (!keySearch.includes("-")) {
                return api.sendMessage(
                    "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗨𝘀𝗲\n━━━━━━━━━━━━━━━\n\nVui lòng nhập truy vấn tìm kiếm và số lượng hình ảnh (1-99). Ví dụ: tomozaki -5",
                    event.threadID,
                    event.messageID
                );
            }

            const lod = await api.sendMessage("Vui lòng đợi.....", event.threadID, event.messageID);
            const keySearchs = keySearch.substr(0, keySearch.indexOf('-')).trim();
            let numberSearch = parseInt(keySearch.split("-").pop().trim()) || 10;

            if (isNaN(numberSearch) || numberSearch < 1 || numberSearch > 10) {
                return api.sendMessage(
                    "⛔ 𝗜𝗻𝘃𝗮𝗹𝗶𝗱 𝗡𝘂𝗺𝗯𝗲𝗿\n━━━━━━━━━━━━━━━\n\nVui lòng nhập một số lượng hình ảnh hợp lệ (1-99). Ví dụ: wallpaper -5",
                    event.threadID,
                    event.messageID
                );
            }

            const apiUrl = `https://ccexplorerapisjonell.vercel.app/api/pin?title=${keySearch}&count=${numberSearch}`;
            console.log(`Đang lấy dữ liệu từ API: ${apiUrl}`);

            const res = await axios.get(apiUrl);
            const data = res.data.data;

            if (!data || data.length === 0) {
                return api.sendMessage(
                    `Không tìm thấy kết quả cho truy vấn của bạn "${keySearchs}". Vui lòng thử với truy vấn khác.`,
                    event.threadID,
                    event.messageID
                );
            }

            const imgData = [];

            for (let i = 0; i < Math.min(numberSearch, data.length); i++) {
                console.log(`Đang lấy hình ảnh ${i + 1} từ URL: ${data[i]}`);
                const imgResponse = await axios.get(data[i], { responseType: "arraybuffer" });
                const imgPath = path.join(__dirname, "cache", `${i + 1}.jpg`);
                await fs.outputFile(imgPath, imgResponse.data);
                imgData.push(fs.createReadStream(imgPath));
            }

            await api.sendMessage({
                body: `📸 𝗣𝗶𝗻𝘁𝗲𝗿𝗲𝘀𝘁\n━━━━━━━━━━━━━━━\n\nĐây là ${numberSearch} kết quả hàng đầu cho truy vấn của bạn "${keySearchs}"`,
                attachment: imgData,
            }, event.threadID, event.messageID);
            
            api.unsendMessage(lod.messageID);
            console.log(`Hình ảnh đã được gửi thành công tới nhóm ${event.threadID}`);

            await fs.remove(path.join(__dirname, "cache"));
            console.log("Thư mục cache đã được dọn dẹp.");

        } catch (error) {
            console.error("Lỗi khi lấy hình ảnh từ Pinterest:", error);
            return api.sendMessage(
                `Đã xảy ra lỗi khi lấy hình ảnh. Vui lòng thử lại sau.`,
                event.threadID,
                event.messageID
            );
        }
    }
};
