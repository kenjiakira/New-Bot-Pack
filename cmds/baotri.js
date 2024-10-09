module.exports = {
    name: "baotri",
    usedby: 2,
    info: "Bảo trì bot",
    onPrefix: true,
    hide: true,
    dev: "Jonell Magallanes",
    cooldowns: 5,
  
    onLaunch: async function({ api, event, target }) {
      var fs = require("fs");
      var request = require("request");
      const adminConfig = JSON.parse(fs.readFileSync("admin.json", "utf8"));
      const content = target.join(" ");
  
      api.getThreadList(30, null, ["INBOX"], (err, list) => {
        if (err) { 
          console.error("LỖI: " + err);
          return;
        }
  
        list.forEach(thread => {
          if(thread.isGroup === true && thread.threadID !== event.threadID) {
            var link = "https://i.postimg.cc/NFdDc0vV/RFq-BU56n-ES.gif";  
            var callback = () => api.sendMessage({ 
              body: ` DEV MOD \n━━━━━━━━━━━━━━━━━━\n${adminConfig.botName} đang trong chế độ bảo trì. Xin vui lòng chờ.\n\n𝖱𝖾𝖺𝗌𝗈𝗇: ${content}\n\n𝖣𝖾𝗏𝖾𝗅𝗈𝗉𝖾𝗋: ${adminConfig.ownerName}`, 
              attachment: fs.createReadStream(__dirname + "/cache/maintenance.gif")
            }, 
            thread.threadID, 
            () => { 
              fs.unlinkSync(__dirname + "/cache/maintenance.gif");
              console.log(`Tin nhắn bảo trì đã được gửi đến ${thread.threadID}. Đang tắt bot.`); 
              process.exit(0); 
            });
  
            return request(encodeURI(link))
              .pipe(fs.createWriteStream(__dirname + "/cache/maintenance.gif"))
              .on("close", callback);
          }
        });
      });
  
      console.log("Bot hiện đang trong chế độ bảo trì.");
    }
  }
  