const axios = require('axios');

module.exports = {
    name: "ip",
    info: "Kiểm tra thông tin IP",
    dev: "NTKhang, Nguyên Blue [convert]",
    onPrefix: true,
    dmUser: false,
    nickName: ["ip"],
    usages: "ip [địa chỉ IP]\n\n" +
            "Hướng dẫn sử dụng:\n" +
            "- `ip [địa chỉ IP]`: Kiểm tra thông tin địa chỉ IP.",
    cooldowns: 5,

    onLaunch: async function ({ api, event, target }) { 
        
        const { threadID, messageID } = event;

        if (!Array.isArray(target) || target.length === 0) {
            return await api.sendMessage("❎ Vui lòng nhập địa chỉ IP bạn muốn kiểm tra.", threadID, messageID);
        }

        try {
            const ipAddress = target.join(' ');
            const response = await axios.get(`http://ip-api.com/json/${ipAddress}?fields=66846719`);
            const infoip = response.data;

            if (infoip.status === 'fail') {
                return await api.sendMessage(`⚠️ Đã xảy ra lỗi: ${infoip.message}`, threadID, messageID);
            }

            const messageBody = `🗺️ Châu lục: ${infoip.continent}\n` +
                                `🏳️ Quốc gia: ${infoip.country}\n` +
                                `🎊 Mã QG: ${infoip.countryCode}\n` +
                                `🕋 Khu vực: ${infoip.region}\n` +
                                `⛱️ Vùng/Tiểu bang: ${infoip.regionName}\n` +
                                `🏙️ Thành phố: ${infoip.city}\n` +
                                `🛣️ Quận/Huyện: ${infoip.district}\n` +
                                `📮 Mã bưu chính: ${infoip.zip}\n` +
                                `🧭 Latitude: ${infoip.lat}\n` +
                                `🧭 Longitude: ${infoip.lon}\n` +
                                `⏱️ Timezone: ${infoip.timezone}\n` +
                                `👨‍✈️ Tên tổ chức: ${infoip.org}\n` +
                                `💵 Đơn vị tiền tệ: ${infoip.currency}`;

            return await api.sendMessage({
                body: messageBody,
                location: {
                    latitude: infoip.lat,
                    longitude: infoip.lon,
                    current: true
                }
            }, threadID, messageID);
        } catch (error) {
            console.error(error);
            return await api.sendMessage("⚠️ Đã xảy ra lỗi khi kiểm tra IP. Vui lòng thử lại sau.", threadID, messageID);
        }
    }
};
