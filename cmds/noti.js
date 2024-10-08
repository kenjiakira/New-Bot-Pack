module.exports = {
  name: "noti",
  usedby: 2,
  onPrefix: true,
  dev: "Jonell Magallanes",
  info: "Gửi thông báo từ nhà phát triển",
  cooldowns: 30,
  onLaunch: async function({ api, event, target }) {
    const content = target.join(" ");
    if (!content) return api.sendMessage("Vui lòng nhập một thông điệp thông báo.", event.threadID);

    let senderInfo = await api.getUserInfo(event.senderID);
    let senderName = senderInfo[event.senderID].name;

    const jonell = `👤 𝗧𝗵𝗼̂𝗻𝗴 𝗯𝗮́𝗼\n━━━━━━━━━━━━━━━━━━\n${content}\n\nNhà phát triển: ${senderName}`;

    try {
      let threads = await api.getThreadList(500, null, ['INBOX']);
      let threadIDs = threads
        .filter(thread => thread.isGroup) 
        .map(thread => thread.threadID);

      threadIDs.forEach(id => {
        api.sendMessage(jonell, id);
      });

      api.sendMessage(`📝 𝗦𝗲𝗻𝗱𝗶𝗻𝗴 𝗧𝗵𝗿𝗲𝗮𝗱𝘀 𝗥𝗲𝘀𝘂𝗹𝘁 \n━━━━━━━━━━━━━━━━━━\nThông báo đã được gửi đến ${threadIDs.length} nhóm.`, event.threadID);
    } catch (error) {
      console.error('[ERROR]', error);
      api.sendMessage('Đã xảy ra lỗi trong quá trình gửi thông báo.', event.threadID);
    }
  }
};
