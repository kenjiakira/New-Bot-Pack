const { randomInt } = require("crypto");

module.exports = {
    name: "daily",
    dev: "hnt", 
    info: "Nhận đồng hào hàng ngày từ 10,000 đến 50,000.",
    onPrefix: true,
    usages: ".daily: Nhận VNTD hàng ngày.",
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

        if (!global.data.lastClaimed) {
            global.data.lastClaimed = {};
        }

        const lastClaimed = global.data.lastClaimed;
        const now = Date.now();
        const dayInMillis = 24 * 60 * 60 * 1000; 

        if (lastClaimed[senderID] && (now - lastClaimed[senderID]) < dayInMillis) {
            return api.sendMessage("Bạn đã nhận VNTD hôm nay rồi. Hãy quay lại vào ngày mai!", threadID, messageID);
        }

        const amount = randomInt(10000, 50001);

        global.data.balance[senderID] += amount;

        lastClaimed[senderID] = now;
        global.data.lastClaimed = lastClaimed;

        return api.sendMessage(`» Bạn đã nhận ${amount} VNTD! Số dư hiện tại của bạn là: ${global.data.balance[senderID]} VNTD.`, threadID, messageID);
    }
};
