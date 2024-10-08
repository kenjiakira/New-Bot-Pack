const fs = require('fs');

let bannedThreads = {};

try {
    bannedThreads = JSON.parse(fs.readFileSync('./database/ban/threads.json'));
} catch (err) {
    console.error("Lỗi khi đọc tệp dữ liệu nhóm bị cấm:", err);
}

const saveBannedData = () => {
    fs.writeFileSync('./database/ban/threads.json', JSON.stringify(bannedThreads, null, 2));
};

module.exports = {
    name: "groupthread",
    usedby: 4,
    info: "Cấm hoặc bỏ cấm nhóm trò chuyện",
    onPrefix: true,
    cooldowns: 20,

    onLaunch: async function ({ event, target, api }) {
        const action = target[0].toLowerCase();
        let targetID = target[1] || event.threadID;
        const reason = target.slice(2).join(' ') || "Vi phạm quy định nhóm";

        if (action === 'ban') {
            bannedThreads[targetID] = { reason };
            saveBannedData();
            return api.sendMessage(`𝗧𝗵𝗿𝗲𝗮𝗱 𝗕𝗮𝗻 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲\n━━━━━━━━━━━━━━━━━━\nNhóm ${targetID} đã bị cấm. Lý do: ${reason}`, event.threadID, () => {
                process.exit(1);
            });

        } else if (action === 'unban') {
            if (bannedThreads[targetID]) {
                delete bannedThreads[targetID];
                saveBannedData();
                return api.sendMessage(`𝗧𝗵𝗿𝗲𝗮𝗱 𝗨𝗻𝗯𝗮𝗻 𝗖𝗼𝗺𝗽𝗹𝗲𝘁𝗲𝗱\n━━━━━━━━━━━━━━━━━━\nNhóm ${targetID} đã được bỏ cấm.`, event.threadID, () => {
                    process.exit(1);
                });
            } else {
                return api.sendMessage(`𝗧𝗵𝗿𝗲𝗮𝗱 𝗚𝗰𝗕𝗮𝗻 𝗠𝗮𝗻𝗮𝗴𝗲𝗿\n━━━━━━━━━━━━━━━━━━\nNhóm ${targetID} không bị cấm.`, event.threadID);
            }
        } else {
            return api.sendMessage("Hành động không hợp lệ. Sử dụng 'ban' để cấm nhóm hoặc 'unban' để bỏ cấm nhóm.", event.threadID);
        }
    }
};
