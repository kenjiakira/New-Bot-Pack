// Error Code

const fs = require('fs');
const moment = require('moment-timezone');

module.exports = {
    name: "greet",
    info: "Lệnh chào mừng và tạm biệt.",
    dev: "HNT",
    onPrefix: false,
    dmUser: false,
    nickName: ["greet"],
    usages: "[text]",
    cooldowns: 0,

    botUIDs: ["100056955484415", "100040203282108", "100092325757607"],

    onEvents: async function ({ event, api, Users, actions }) {
        const greetKeywords = ["hello", "hi", "chào", "lô", "hii", "helo"];
        const byeKeywords = ["bye", "bai", "off", "byee", "pai"];

        if (event.body && !this.botUIDs.includes(event.senderID)) {
            const stickerData = [
                "526214684778630", "526220108111421", "526220308111401", 
                "526220484778050", "526220691444696", "526220814778017", 
                "526220978111334", "526221104777988", "526221318111300", 
                "526221564777942", "526221711444594", "526221971444568", 
                "2041011389459668", "2041011569459650", "2041011726126301", 
                "2041011836126290", "2041011952792945", "2041012109459596", 
                "2041012262792914", "2041012406126233", "2041012539459553", 
                "2041012692792871", "2041014432792697", "2041014739459333", 
                "2041015016125972", "2041015182792622", "2041015329459274", 
                "2041015422792598", "2041015576125916", "2041017422792398", 
                "2041020049458802", "2041020599458747", "2041021119458695", 
                "2041021609458646", "2041022029458604", "2041022286125245"
            ];

            const sticker = stickerData[Math.floor(Math.random() * stickerData.length)];
            const currentTime = moment.tz('Asia/Ho_Chi_Minh');
            const hours = currentTime.hours();
            const textOptions = ["ngày tuyệt vời", "buổi tối vui vẻ", "một ngày thật đáng yêu"];
            const text = textOptions[Math.floor(Math.random() * textOptions.length)];
            const session = (
                hours >= 5 && hours < 10 ? "buổi sáng" :
                hours >= 10 && hours < 13 ? "buổi trưa" :
                hours >= 13 && hours < 17 ? "buổi chiều" :
                hours >= 17 && hours < 21 ? "buổi tối" : 
                "buổi đêm"
            );

            try {
                const name = await Users.getNameUser(event.senderID);
                const mentions = [{ tag: name, id: event.senderID }];

                const isGreet = greetKeywords.some(keyword => event.body.toLowerCase().includes(keyword));
                const isBye = byeKeywords.some(keyword => event.body.toLowerCase().includes(keyword));

                if (isGreet) {
                    const msg = {
                        body: `🌟 Chào ${name} 🌟\nChúc bạn ${session} ${text}!`,
                        mentions
                    };
                    await actions.send(msg, event.threadID);
                    setTimeout(() => {
                        api.sendMessage({ sticker }, event.threadID);
                    }, 100);
                } else if (isBye) {
                    const msg = {
                        body: `👋 Tạm biệt ${name} 👋\nChúc bạn ${session} vui vẻ!`,
                        mentions
                    };
                    await actions.send(msg, event.threadID);
                    setTimeout(() => {
                        api.sendMessage({ sticker }, event.threadID);
                    }, 100);
                }
            } catch (error) {
                console.error("Lỗi khi lấy tên người dùng:", error);
            }
        }
    },

    run: async function ({ event, api, actions }) {
        return await actions.reply("Lệnh đã được cấu hình để luôn luôn hoạt động và không cần bật/tắt.");
    }
};
