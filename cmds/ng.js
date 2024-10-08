const fs = require('fs');
const path = require('path');
const axios = require('axios');

module.exports = {
  name: "ng",
  usedby: 0,
  info: "Lấy nhạc từ Newgrounds",
  onPrefix: true,
  dev: "Jonell Magallanes",
  cooldowns: 10,

  onLaunch: async function ({ api, event, target }) {
    if (!target[0]) {
      return api.sendMessage(`❌ Vui lòng nhập tên bài hát!`, event.threadID);
    }

    try {
      const song = target.join(" ");
      const findingMessage = await api.sendMessage(`🔍 | Đang tìm "${song}". Vui lòng chờ...`, event.threadID);

      const titlesResponse = await axios.get(`https://jonellprojectccapisexplorer.onrender.com/api/newgrounds?query=${song}`);
      const titlesData = titlesResponse.data;

      if (!titlesData.length) {
        await api.sendMessage(`❌ | Không tìm thấy kết quả cho "${song}".`, event.threadID);
        return;
      }

      const firstResult = titlesData[0];
      const { title, link } = firstResult;

      const audioResponse = await axios.get(`https://ccprojectexplorexapisjonellmagallanes.onrender.com/api/ng?play=${song}`);
      const audioData = audioResponse.data;

      if (!audioData || !audioData.url) {
        await api.sendMessage(`❌ | Không tìm thấy âm thanh cho "${song}".`, event.threadID);
        return;
      }

      const { url: audioUrl } = audioData;

      await api.editMessage(`⏱️ | Đã tìm thấy tiêu đề bài hát: "${title}". Đang tải xuống...`, findingMessage.messageID);

      const responseStream = await axios.get(audioUrl, {
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      const filePath = path.resolve(__dirname, 'cache', `${Date.now()}-${title}.mp3`);
      const fileStream = fs.createWriteStream(filePath);

      responseStream.data.pipe(fileStream);

      fileStream.on('finish', async () => {
        const stats = fs.statSync(filePath);
        const fileSizeInMB = stats.size / (1024 * 1024);

        if (fileSizeInMB > 25) {
          await api.sendMessage(`❌ | Kích thước tệp vượt quá giới hạn 25MB. Không thể gửi "${title}".`, event.threadID);
          fs.unlinkSync(filePath);
          return;
        }

        await api.sendMessage({
          body: `🎵 | Đây là nhạc của bạn: "${title}"\n\nTiêu đề: ${title}\nLiên kết Newgrounds: ${link}\nLiên kết tải xuống: ${audioUrl}`,
          attachment: fs.createReadStream(filePath)
        }, event.threadID);

        fs.unlinkSync(filePath);
        api.unsendMessage(findingMessage.messageID);
      });

      responseStream.data.on('error', async (error) => {
        console.error(error);
        await api.sendMessage(`❌ | Xin lỗi, đã xảy ra lỗi khi tải nhạc: ${error.message}`, event.threadID);
        fs.unlinkSync(filePath);
      });
    } catch (error) {
      console.error(error);
      await api.sendMessage(`❌ | Xin lỗi, đã xảy ra lỗi khi lấy nhạc: ${error.message}`, event.threadID);
    }
  }
}
