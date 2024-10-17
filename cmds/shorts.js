const axios = require('axios');
const fs = require('fs');
const path = require('path');

const apikey = 'shoti-0c84a66d4efac6d30bd14600d604e134fa513aef0098f4b4403cd73e10cea235984c607ee279236eef4f7d3807eaa7a57259592f140bb92897a9e39432ba18d557ead768f67babc6d9c9152c9cd6b69ed12599b723';

module.exports = {
  name: "shorts",
  usedby: 0,
  info: "Video shorts ngẫu nhiên",
  dev: "Jonell Magallanes",
  dmUser: false,
  onPrefix: true,
  cooldowns: 9,

  onLaunch: async function ({ api, event, actions }) {
    try {
      const ha = global.fonts.bold("⏱️ Đang gửi shorts");
      const umay = await actions.reply(`${ha}\n${global.line}\nĐang lấy video shorts, vui lòng chờ...`);
      const startTime = Date.now();

      const response = await axios.get(`https://shoti.kenliejugarap.com/getvideo.php?apikey=${apikey}`);
      
      if (response.data.status && response.data.response) {
        const videoDownloadLink = response.data.videoDownloadLink;
        const title = response.data.title;
        const tikUrl = response.data.tiktokUrl;
        const cacheDir = path.join(__dirname, 'cache');
        const filePath = path.join(cacheDir, 'video.mp4');
        actions.edit(`📝 | Tên video: ${title} và URL TikTok: ${tikUrl}`, umay.messageID, event.threadID);

        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir);
        }

        const videoStream = await axios({
          method: 'GET',
          url: videoDownloadLink,
          responseType: 'stream'
        });

        const writer = fs.createWriteStream(filePath);
        videoStream.data.pipe(writer);

        writer.on('finish', () => {
          const endTime = Date.now(); 
          const duration = endTime - startTime; 
          const bold = global.fonts.bold("✅ Gửi thành công");
          const msg = {
            body: `${bold}\n${global.line}\nDưới đây là video Shorts của bạn\n\n📝 Tiêu đề: ${title}\n🔗 URL TikTok: ${tikUrl}\n\n⏱️ Độ trễ: ${duration}ms`,
            attachment: fs.createReadStream(filePath)
          };
          api.sendMessage(msg, event.threadID);
        });
        api.unsendMessage(umay.messageID);
        writer.on('error', (error) => {
          api.sendMessage(error.message, event.threadID);
        });
      } else {
        api.sendMessage("Không thể lấy video, vui lòng thử lại sau.", event.threadID);
      }
    } catch (error) {
      api.sendMessage(`Đã xảy ra lỗi: ${error.message}`, event.threadID);
    }
  }
};
