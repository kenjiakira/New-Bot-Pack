const fs = require('fs');
const adminConfigPath = "./admin.json";
const usersPath = "./database/users.json";
const threadsPath = "./database/threads.json";
const chalk = require('chalk');
const gradient = require('gradient-string');
const moment = require("moment-timezone");

const time = moment.tz("Asia/Ho_Chi_Minh").format("LLLL");
let adminConfig = { adminUIDs: [], notilogs: true };
let usersData = {};
let threadsData = {};

const gradientText = (text) => gradient('cyan', 'pink')(text);
const boldText = (text) => chalk.bold(text);

try {
    adminConfig = JSON.parse(fs.readFileSync(adminConfigPath, "utf8"));
    usersData = JSON.parse(fs.readFileSync(usersPath, "utf8"));
    threadsData = JSON.parse(fs.readFileSync(threadsPath, "utf8"));
} catch (err) {
    console.error(err);
}

const notifyAdmins = async (api, threadID, action, senderID) => {
    if (adminConfig.notilogs) {  // Check if notifications are enabled
        const groupName = await getGroupName(api, threadID);
        const addedOrKickedBy = await getUserName(api, senderID);

        const notificationMessage = `🔔 𝗕𝗼𝘁 𝗥𝗲𝗰𝗼𝗿𝗱𝘀 𝗗𝗮𝘁𝗮 𝗡𝗼𝘁𝗶\n━━━━━━━━━━━━━━━━━━\n📝 Bot has been ${action} from ${groupName}\n🆔 ThreadID: ${threadID}\n🕜 Time: ${time}\n━━━━━━━━━━━━━━━━━━`;

        if (Array.isArray(adminConfig.adminUIDs) && adminConfig.adminUIDs.length > 0) {
            for (const adminID of adminConfig.adminUIDs) {
                // await api.sendMessage(notificationMessage, adminID); // Disabled for now
            }
        } else {
            console.error("ID quản trị viên không được xác định hoặc không phải là một mảng.");
        }
    } else {
        console.log(`${boldText(gradientText(`THÔNG BÁO CỦA QUẢN TRỊ VIÊN: NHẬT KÝ THÔNG BÁO BỊ TẮT`))}`);
    }
};

const logChatRecord = async (api, event) => {
    const threadID = event.threadID;
    const senderID = event.senderID;
    const userName = await getUserName(api, senderID);
    const groupName = await getGroupName(api, threadID);
    const logHeader = gradientText("━━━━━━━━━━[ CHUỖI CSDL NHẬT KÝ BOT ]━━━━━━━━━━");

    if (event.body) {
        console.log(logHeader);
        console.log(gradientText("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"));
        console.log(`${boldText(gradientText(`┣➤ Nhóm: ${groupName}`))}`);
        console.log(`${boldText(gradientText(`┣➤ ID nhóm: ${threadID}`))}`);
        console.log(`${boldText(gradientText(`┣➤ ID Người dùng: ${senderID}`))}`);
        console.log(`${boldText(gradientText(`┣➤ nội dung: ${event.body}`))}`);
        console.log(`${boldText(gradientText(`┣➤ vào lúc: ${time}`))}`);
        console.log(gradientText("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"));
    } else if (event.attachments || event.stickers) {
        console.log(logHeader);
        console.log(gradientText("┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓"));
        console.log(`${boldText(gradientText(`┣➤ Nhóm: ${groupName}`))}`);
        console.log(`${boldText(gradientText(`┣➤ ID nhóm: ${threadID}`))}`);
        console.log(`${boldText(gradientText(`┣➤ ID Người dùng: ${senderID}`))}`);
        console.log(`${boldText(gradientText(`┣➤ nội dung: ${userName} gửi 1 nhãn dán`))}`);
        console.log(`${boldText(gradientText(`┣➤ vào lúc: ${time}`))}`);
        console.log(gradientText("┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛"));
    }
};

const handleBotAddition = async (api, threadID, senderID) => {
    const userName = await getUserName(api, senderID);
    const groupName = await getGroupName(api, threadID);
    console.log(`Bot đã được thêm vào nhóm.\ntên nhóm: ${groupName}\nThreadID: ${threadID}\nThêm bởi: ${userName}`);
};

const handleBotRemoval = async (api, threadID, senderID) => {
    const userName = await getUserName(api, senderID);
    const groupName = await getGroupName(api, threadID);
    console.log(`Bot đã bị xóa khỏi nhóm.\ntên nhóm: ${groupName}\nThreadID: ${threadID}\nbị xóa bởi: ${userName}`);
    await removeFromDatabase(threadID, senderID);
};

const removeFromDatabase = (threadID, senderID) => {
    let removed = false;
    if (usersData[senderID]) {
        delete usersData[senderID];
        fs.writeFileSync(usersPath, JSON.stringify(usersData, null, 2));
        console.log(`[DATABASE] xóa senderID: ${senderID}`);
        removed = true;
    }
    if (threadsData[threadID]) {
        delete threadsData[threadID];
        fs.writeFileSync(threadsPath, JSON.stringify(threadsData, null, 2));
        console.log(`[DATABASE] xóa threadID: ${threadID}`);
        removed = true;
    }
    return removed;
};

const getGroupName = async (api, threadID) => {
    try {
        const threadInfo = await api.getThreadInfo(threadID);
        return threadInfo.name || "Group Chat";
    } catch (error) {
        console.error(`Thất bại khi lấy tên của threadID: ${threadID}`, error);
        return "Group Chat";
    }
};

const getUserName = async (api, userID) => {
    try {
        const userInfo = await api.getUserInfo(userID);
        return userInfo[userID]?.name || "Unknown User";
    } catch (error) {
        console.error(`Thất bại khi lấy tên của userID: ${userID}`, error);
        return "Unknown User";
    }
};

module.exports = { logChatRecord, notifyAdmins, handleBotAddition, handleBotRemoval };
 