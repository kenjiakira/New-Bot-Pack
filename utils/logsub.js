const handleLogSubscribe = (api, event, adminConfig) => {
  if (event.logMessageData.addedParticipants.some(i => i.userFbId == api.getCurrentUserID())) {
      api.changeNickname(`${adminConfig.botName} • [ ${adminConfig.prefix} ]`, event.threadID, api.getCurrentUserID());
      return api.shareContact(`✅ 𝗕𝗼𝘁 𝗖𝗼𝗻𝗻𝗲𝗰𝘁𝗲𝗱\n━━━━━━━━━━━━━━━━━━\n${adminConfig.botName} Bot đã kết nối thành công!\ngõ "${adminConfig.prefix}help" để xem toàn bộ tất cả các lệnh\n\nLiên hệ: ${adminConfig.ownerName}`, api.getCurrentUserID(), event.threadID);
  } else {
      const { threadID } = event;
      api.getThreadInfo(threadID, (err, threadInfo) => {
          if (err) return console.error(err);
          let { threadName, participantIDs } = threadInfo;
          var tn = threadName || "Unnamed group";
          let addedParticipants = event.logMessageData.addedParticipants;

          for (let newParticipant of addedParticipants) {
              let userID = newParticipant.userFbId;
              api.getUserInfo(parseInt(userID), (err, data) => {
                  if (err) return console.error(err);
                  var obj = Object.keys(data);
                  var userName = data[obj].name.replace("@", "");

                  if (userID !== api.getCurrentUserID()) {
                      api.shareContact(`xin chào ${userName}!\nChào mừng bạn đã đến với Group ${tn}\nBạn là thành viên thứ ${participantIDs.length} thành viên trong nhóm này!`, newParticipant.userFbId, event.threadID);
                  }
              });
          }
      });
  }
};

module.exports = { handleLogSubscribe };
