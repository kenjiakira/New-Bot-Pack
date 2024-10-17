const axios = require('axios');
const { dmUser } = require('./uid');

const formatDate = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getUTCDate()).padStart(2, '0');
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const year = String(date.getUTCFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};

module.exports = {
  name: 'roblox',
  dev: 'HNT',
  info: 'Lấy thông tin người dùng Roblox ',
  usages: 'roblox [Tên người dùng]',
  dmUser: false,
  onPrefix: true,
  cooldowns: 10,
 
  onLaunch: async function({ api, event, target }) {
    const { threadID, messageID } = event;
    const [username] = target;
  
    if (!username) {
      return api.sendMessage(`⚠️ Vui lòng cung cấp tên người dùng.\nVí dụ: .roblox builderman`, threadID, messageID);
    }
  
    try {
      const userResponse = await axios.post('https://users.roblox.com/v1/usernames/users', {
        usernames: [username],
        excludeBannedUsers: true
      });
  
      const userData = userResponse.data.data[0];
      if (!userData) {
        return api.sendMessage(`❌ Không tìm thấy người dùng '${username}'.`, threadID, messageID);
      }
  
      const { name, id, displayName, hasVerifiedBadge } = userData;
      let message = `👤 - Tên người dùng: ${name}\n`;
      message += `🌟 - Tên hiển thị: ${displayName}\n`;
      message += `🆔 - ID người dùng: ${id}\n`;
      message += `🏅 - Huy hiệu: `;
  
      const badgesResponse = await axios.get(`https://accountinformation.roblox.com/v1/users/${id}/roblox-badges`);
      const badges = badgesResponse.data;
      badges.forEach(badge => {
        message += `${badge.name}, `;
      });
      message = message.slice(0, -2);
  
      const userDetailResponse = await axios.get(`https://users.roblox.com/v1/users/${id}`);
      const { description, created, isBanned } = userDetailResponse.data;
      message += `\n\n📝 - Mô tả: ${description || 'Chưa có mô tả'}\n\n`;
      message += `✅ - Đã xác thực: ${hasVerifiedBadge ? 'Có' : 'Không'}\n`;
      message += `📅 - Ngày tạo: ${formatDate(created)}\n`;
      message += `🚫 - Bị cấm: ${isBanned ? 'Có' : 'Không'}\n`;
      message += `🔗 - Hồ sơ: https://roblox.com/users/${id}\n`;
  
      const gamesResponse = await axios.get(`https://games.roblox.com/v2/users/${id}/games?`);
      const games = gamesResponse.data.data;
      if (games.length > 0) {
        message += `🎮 - Trò chơi:\n\n`;
        games.forEach(game => {
          message += `┌\n    🎲 - Tên: ${game.name}\n`;
          message += `    📝 - Mô tả: ${game.description || 'N/A'}\n`;
          message += `    👥 - Lượt truy cập: ${game.placeVisits}\n`;
          message += `    📅 - Ngày tạo: ${formatDate(game.created)}\n`;
          message += `    🕒 - Cập nhật: ${formatDate(game.updated)}\n└\n`;
        });
      } else {
        message += '❌ Không tìm thấy trò chơi nào.\n';
      }
  
      api.sendMessage(message, threadID, messageID);
    } catch (error) {
      console.error('Lỗi khi xử lý lệnh:', error);
      api.sendMessage('❌ Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại sau.', threadID, messageID);
    }
  }
};