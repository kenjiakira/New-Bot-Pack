const axios = require('axios');
const cheerio = require('cheerio');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const API_KEYS = [
    "AIzaSyDMp6YNWYUw_wQBdv4DjkAOvZXJv7ITRy0",
    "AIzaSyDysChx19Lu3hAFpE2knZwkoCWGTN2gfy0",
    "AIzaSyCTvL29weT4BIn7WtFtTvsaQ5Jt6Dm4mBE",
    "AIzaSyDoCGS2-hagw5zWVMfL5iqAVRFNivtbam4",
    "AIzaSyASuW0stXR61_xJ3s0XP3Qw0RoudGCjQRQ",
    "AIzaSyC78Dqs1rdEfj4JcmlSFEBhJZLOJzWmt_Y",
    "AIzaSyDpqfVtdyGLfipEdRNFfUQbCH-prn1sHEs",
    "AIzaSyArI6Ww02Ill7b6Bx5itiKlHD62siAFLIc",
    "AIzaSyBgYVR81UeL7kYouxcwzUL75YOBafgNphU"
];

module.exports = {
    name: "news",
    info: "Xem tin tức mới nhất",
    dev: "HungCho mod by Hoàng Ngọc Từ",
    onPrefix: true,
    dmUser: false,
    nickName: ["news"],
    usages: "news\n\nLệnh này lấy tin tức mới nhất từ VnExpress và gửi đến bạn",
    cooldowns: 0,
    dependencies: { "axios": "", "cheerio": "", "@google/generative-ai": "" },

    generateNewsDescription: async function(newsData) {
        let description = '';

        for (let i = 0; i < API_KEYS.length; i++) {
            const genAI = new GoogleGenerativeAI(API_KEYS[i]);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

            const prompt = `
                Hãy tạo một đoạn mô tả ngắn gọn và hấp dẫn cho tin tức sau:
                - Tiêu đề: ${newsData.title}
                - Nội dung: ${newsData.content}
                - Link: ${newsData.link}

                Sử dụng phong cách tường thuật tin tức, thêm emoji nếu có thể, và làm cho mô tả trở nên sinh động và hấp dẫn.
            `;

            try {
                const result = await model.generateContent([{ text: prompt }]);
                description = await result.response.text();
                break;
            } catch (error) {
                console.error(`Lỗi khi sử dụng API Gemini với API key thứ ${i + 1}:`, error);
                if (i === API_KEYS.length - 1) {
                    console.warn("Tất cả API keys đã chết, quay lại sử dụng mô tả gốc.");
                    return `Tiêu đề: ${newsData.title}\nNội dung: ${newsData.content}\nLink: ${newsData.link}`;
                }
            }
        }

        return description;
    },

    onLaunch: async function({ api, event }) {
        try {
            const response = await axios.get('https://vnexpress.net/tin-tuc-24h');
            const $ = cheerio.load(response.data);
            const thoigian = $('.time-count');
            const tieude = $('.thumb-art');
            const noidung = $('.description');

            const time = thoigian.find('span').attr('datetime');
            const title = tieude.find('a').attr('title');
            const des = noidung.find('a').text();
            const link = noidung.find('a').attr('href');
            const description = des.split('.');

            const newsData = {
                title: title,
                content: description[0],
                link: link
            };

            const newsDescription = await this.generateNewsDescription(newsData);

            const message = `===  [ 𝗧𝗜𝗡 𝗧𝗨̛́𝗖 ] ===\n━━━━━━━━━━━━━\n📺 Tin tức mới nhất\n⏰ Thời gian đăng: ${time}\n📰 Tiêu đề: ${newsData.title}\n\n📌 Nội dung: ${newsDescription}\n🔗 Link: ${newsData.link}\n`;

            await api.sendMessage(message, event.threadID, event.messageID);
        } catch (error) {
            console.error(error);
            await api.sendMessage("Đã xảy ra lỗi khi lấy tin từ VnExpress.", event.threadID, event.messageID);
        }
    }
};
