const axios = require("axios");
const fs = require("fs");
const path = require("path");

module.exports = {
  name: "tiktok",
  usedby: 0,
  onPrefix: true,
  dev: "Jonell Magallanes",
  cooldowns: 30,

  onLaunch: async function({ api, event, target, actions }) {
    try {
      const searchQuery = target.join(" ");
      if (!searchQuery) {
        api.sendMessage("Cách sử dụng: tiktok <văn bản tìm kiếm>", event.threadID);
        return;
      }

      const s = await actions.reply("Đang tìm kiếm");

      const response = await axios.get(`https://jonellccapisprojectv2-a62001f39859.herokuapp.com/api/tiktok/searchvideo?keywords=${encodeURIComponent(searchQuery)}`);
      const videos = response.data.data.videos;

      if (!videos || videos.length === 0) {
        api.sendMessage("Không tìm thấy video nào cho truy vấn tìm kiếm đã cho.", event.threadID);
        return;
      }

      const videoData = videos[0];
      const videoUrl = videoData.play;
      const message = `𝗥𝗲𝘀𝘂𝗹𝘁 𝗩𝗶𝗱𝗲𝗼 𝗧𝗶𝗸𝘁𝗼𝗸\n━━━━━━━━━━━━━━━━━━\nNgười đăng: ${videoData.author.nickname}\nTên người dùng: ${videoData.author.unique_id}\n\nTiêu đề: ${videoData.title}`;

      const filePath = path.join(__dirname, `/cache/tiktok_video.mp4`);
      const writer = fs.createWriteStream(filePath);
      const videoResponse = await axios({
        method: 'get',
        url: videoUrl,
        responseType: 'stream'
      });

      videoResponse.data.pipe(writer);

      writer.on('finish', () => { 
        api.unsendMessage(s.messageID);
        api.sendMessage({ body: message, attachment: fs.createReadStream(filePath) },
          event.threadID,
          () => {
            fs.unlinkSync(filePath);
          }
        );
      });
    } catch (error) {
      console.error('Lỗi:', error);
      api.sendMessage("Đã xảy ra lỗi trong quá trình xử lý yêu cầu.", event.threadID);
    }
  }
};
