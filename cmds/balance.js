module.exports = {
    name: "balance",
    dev: "HNT", 
    info: "Kiểm tra số dư tài khoản của bạn",
    onPrefix: true,
    usages: ".balance: Kiểm tra số dư tài khoản của bạn.",
    cooldowns: 0,

    onLaunch: async function({ api, event }) {
        const { threadID, messageID, senderID } = event;

        if (!global.data) {
            global.data = {}; 
        }

        if (!global.data.balance) {
            global.data.balance = {}; 
        }

        if (typeof global.data.balance[senderID] === "undefined") {
            global.data.balance[senderID] = 0; 
        }

        const balance = global.data.balance[senderID];

        return api.sendMessage(`» Số dư tài khoản của bạn là: ${balance} VNTD`, threadID, messageID);
    }
};
