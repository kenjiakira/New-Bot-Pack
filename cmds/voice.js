const axios = require('axios');
const fs = require('fs');
const path = require('path');

module.exports = {
    name: "voice",
    info: "Chuyển văn bản thành giọng nói",
    dev: "HNT",
    onPrefix: true,
    dmUser: false,
    nickName: ["voice", "voic"],
    usages: "[ngôn ngữ] [văn bản]",
    cooldowns: 5,

    onLaunch: async function ({ event, target, actions }) {
        try {
            const { createReadStream, unlinkSync, stat } = require("fs-extra");
            const { resolve } = require("path");

            const content = (event.type == "message_reply") ? event.messageReply.body : target.join(" ");
            
            const defaultLanguage = "vi";
            let languageToSay = (["ru", "en", "ko", "ja", "tl", "fr"].some(item => content.indexOf(item) === 0)) 
                ? content.slice(0, content.indexOf(" ")) 
                : (global.config && global.config.language) ? global.config.language : defaultLanguage;

            let msg = (languageToSay !== defaultLanguage) 
                ? content.slice(3).trim() 
                : content.trim();

            if (!msg) {
                return await actions.reply("Vui lòng nhập văn bản cần chuyển thành giọng nói!");
            }

            if (msg.length > 100) {
                return await actions.reply("⚠️ Văn bản không được vượt quá 100 ký tự. Vui lòng nhập lại.");
            }

            const filePath = resolve(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);

            const response = await axios({
                url: `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${languageToSay}&client=tw-ob`,
                method: 'GET',
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(filePath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on('finish', resolve);
                writer.on('error', reject);
            });

            const stats = await stat(filePath);
            const fileSizeInBytes = stats.size;
            const maxSizeBytes = 80 * 1024 * 1024; 

            if (fileSizeInBytes > maxSizeBytes) {
                unlinkSync(filePath);
                return await actions.reply('⚠️ Không thể gửi tệp vì kích thước lớn hơn 80MB.');
            }

            await actions.reply({ attachment: createReadStream(filePath) });
            unlinkSync(filePath);
        } catch (error) {
            console.error(error);
            await actions.reply("Đã xảy ra lỗi khi thực hiện chuyển văn bản thành giọng nói.");
        }
    }
};
