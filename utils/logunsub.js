const handleLogUnsubscribe = async (api, event) => {
  if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;

  try {
      let { threadName, participantIDs } = await api.getThreadInfo(event.threadID);
      const type = (event.author == event.logMessageData.leftParticipantFbId) ? "rời khỏi nhóm." : "bị đá bởi Quản trị viên của nhóm";
      let name = (await api.getUserInfo(event.logMessageData.leftParticipantFbId))[event.logMessageData.leftParticipantFbId].name;

      api.shareContact(`${name} đã được ${type}\nMember’s left: ${participantIDs.length}`, event.logMessageData.leftParticipantFbId, event.threadID);
  } catch (err) {
      console.error("ERROR: ", err);
  }
};

module.exports = { handleLogUnsubscribe };
