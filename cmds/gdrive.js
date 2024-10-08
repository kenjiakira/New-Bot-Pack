const axios = require('axios');

module.exports = {
  name: "gdrive",
  usedby: 0,
  dev: "Jonell Magallanes",
  info: "Nhận URL tải xuống từ video, âm thanh gửi từ nhóm và lấy liên kết Google Drive không hết hạn.",
  onPrefix: false,
  dmUser: false,
  usages: "getLink",
  cooldowns: 5,

  onLaunch: async ({ api, event }) => {

    if (event.type !== "message_reply") return api.sendMessage("Loại phương tiện không hợp lệ", event.threadID, event.messageID);

    const va = "Loại phương tiện không hợp lệ";

    if (!event.messageReply.attachments || event.messageReply.attachments.length === 0) return api.sendMessage(va, event.threadID, event.messageID);

    if (event.messageReply.attachments.length > 1) return api.sendMessage(va, event.threadID, event.messageID);

    const pro = await api.sendMessage("Đang tải URL tệp đính kèm.....", event.threadID, event.messageID);

    const attachmentUrl = event.messageReply.attachments[0].url; 

    try {
 
      const apiUrl = `http://de01.uniplex.xyz:5611/api/upload?url=${attachmentUrl}`;

      api.editMessage("Đang tải lên Google Drive......", pro.messageID, event.threadID, event.messageID);

      const response = await axios.get(apiUrl);
      const responseData = response.data;

      api.editMessage("Hoàn thành.", pro.messageID, event.threadID, event.messageID);

      return api.editMessage(`☁️ 𝗧𝗮̉𝗶 𝗹𝗲̂𝗻 𝗳𝗶𝗹𝗲 𝗟𝗲̂𝗻 𝗚𝗼𝗼𝗴𝗹𝗲 𝗗𝗿𝗶𝘃𝗲 \n━━━━━━━━━━━━━━━━━━\n${responseData}`, pro.messageID, event.threadID, event.messageID);

    } catch (error) {

      console.error('Lỗi khi gửi yêu cầu đến API bên ngoài:', error);
      return api.sendMessage(error.message, event.threadID, event.messageID);
    }
  }
};
