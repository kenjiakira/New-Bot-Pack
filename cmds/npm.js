const { exec } = require('child_process');
const { nickName } = require('./greet');

module.exports = {
    name: "npm",
    version: "1.0.0",
    info: "Xem thông tin gói npm",
    dev: "HNT",
    nickName: ["npm info", "npm"],
    onPrefix: true,
    cooldowns: 5,

    onLaunch: async function ({ api, event, target }) {
        if (!target[0]) {
            return api.sendMessage("❌ Vui lòng nhập tên gói npm bạn muốn xem thông tin!", event.threadID);
        }

        const packageName = target.join(" ");

        exec(`npm view ${packageName} --json`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Lỗi: ${stderr}`);
                return api.sendMessage(`❌ Không thể tìm thấy gói "${packageName}". Vui lòng kiểm tra lại tên gói!`, event.threadID);
            }

            try {
                const packageInfo = JSON.parse(stdout);
                const message = `
- Tên gói: ${packageInfo.name}
- Phiên bản: ${packageInfo.version}
- Mô tả: ${packageInfo.description || "Không có mô tả."}
- Chủ sở hữu: ${packageInfo.maintainers.map(m => m.name).join(", ") || "Không có thông tin."}
- Liên kết trang chủ: ${packageInfo.homepage || "Không có liên kết."}
- Liên kết kho lưu trữ: ${packageInfo.repository ? packageInfo.repository.url : "Không có kho lưu trữ."}
`;

                api.sendMessage(message, event.threadID);
            } catch (parseError) {
                console.error("Lỗi phân tích JSON:", parseError);
                api.sendMessage("❌ Đã xảy ra lỗi khi xử lý thông tin gói.", event.threadID);
            }
        });
    }
};
