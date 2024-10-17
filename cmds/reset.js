module.exports = {
    name: "reset",
    dev: "HNT", 
    info: "Đặt lại toàn bộ dữ liệu số dư của tất cả người dùng về 0.",
    onPrefix: true,
    usages: ".reset: Đặt lại toàn bộ dữ liệu số dư.",
    cooldowns: 0,

    onLaunch: async function({ api, event }) {
        const { threadID, messageID, senderID } = event;

        const threadInfo = await api.getThreadInfo(threadID);
        const adminIDs = threadInfo.adminIDs.map(admin => admin.id);

        if (!adminIDs.includes(senderID)) {
            return api.sendMessage("Bạn không có quyền thực hiện lệnh này. Chỉ admin nhóm mới có thể sử dụng lệnh này.", threadID, messageID);
        }

        global.data.balance = {}; 

        return api.sendMessage("» Đã đặt lại toàn bộ dữ liệu số dư của tất cả người dùng về 0.", threadID, messageID);
    }
};
