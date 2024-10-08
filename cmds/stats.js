const fs = require("fs");
const os = require("os");

const threadsDB = JSON.parse(fs.readFileSync("./database/threads.json", "utf8") || "{}");
const usersDB = JSON.parse(fs.readFileSync("./database/users.json", "utf8") || "{}");

module.exports = {
  name: "stats",
  usedby: 0,
  info: "Hiển thị trạng thái của bot",
  dev: "Jonell Magallanes",
  onPrefix: true,
  cooldowns: 9,

  onLaunch: async function ({ actions }) {
    const hs = await actions.reply("Đang tải dữ liệu.......")
    const startTime = Date.now();

    const uptimeSeconds = process.uptime();
    const hours = Math.floor(uptimeSeconds / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const seconds = Math.floor(uptimeSeconds % 60);
    const uptime = `${hours} giờ, ${minutes} phút, ${seconds} giây`;

    const osDetails = `${os.type()} ${os.release()} (${os.arch()})`;

    const latency = Date.now() - startTime;

    const data = `👤 Người dùng: ${Object.keys(usersDB).length}\n👥 Nhóm: ${Object.keys(threadsDB).length}\n⏱️ Thời gian hoạt động: ${uptime}\n🖥️ Hệ điều hành: ${osDetails}\n🌐 Độ trễ: ${latency} ms`;

    actions.edit(`𝗗𝗮𝘁𝗮 𝗕𝗼𝘁 𝗦𝘁𝗮𝘁𝘀\n${global.line}\n${data}`, hs.messageID);
  }
};
