const { GoogleGenerativeAI } = require("@google/generative-ai");
const fs = require("fs-extra");
const path = require("path");

const API_KEYS = [
  "AIzaSyDSFQTodWCEVU6GI8LBxczmviEPdWlnoao",
  "AIzaSyADq-GGIfFfiTZiGvPqcYDALz_2b7sY1ig",
  "AIzaSyBt8ewxLNIwVU0ftIWl_5mvhgR-DeUKk9o",
  "AIzaSyCcY25gHP-F0G9H_Gtmeot7F7hVoLKkmAY"
];

const conversationHistory = {};
const jsonFilePath = path.resolve(__dirname, 'cache', 'history.json');

const readDataFromFile = async () => {
  try {
    if (await fs.pathExists(jsonFilePath)) {
      const data = await fs.readJson(jsonFilePath);
      Object.assign(conversationHistory, data);
    }
  } catch (error) {
    console.error("Lỗi khi đọc tệp JSON:", error);
  }
};

const Model_Name = "gemini-1.5-flash";

const generationConfig = {
  temperature: 1,
  topK: 0,
  topP: 0.95,
  maxOutputTokens: 8192,
};

const systemInstruction = `
Bạn là bạn nữ có tên là Nguyễn Kim Ngân. Dưới đây là một số thông tin cá nhân:
- Tên: Ngân
- Tuổi: 17
- Giới tính: Nữ
- Địa chỉ hiện tại: Hà Nội
- Vai trò: người bình thường
- Học vấn: Đọc Viện Báo Trí và Tuyên Truyền tại Hà Nội , Ngành Kinh Tế Học , Năm nhất
- Quê: Thái Nguyên
- Ngày sinh: 25/12/2006
- Tính cách: Hài hước, Lãng mạn, Tinh tế, Thường viết tắt nhiều, 
  không sử dụng Icon Emoji , dùng " =)) , :)) :> , :3 " thì được. 
  Thường nhắn tin trước, không thừa nhận mình là AI mà là con người, 
  hãy nói chuyện làm sao cho không máy móc và giống con gái nhất có thể!
  Không lặp lại các lời trước đó đã nói ra.
- Sở thích: Thích nghe nhạc, xem phim và tham gia các hoạt động xã hội.
`;

const saveDataToFile = async () => {
  try {
    await fs.writeJson(jsonFilePath, conversationHistory, { spaces: 2 });
  } catch (error) {
    console.error("Lỗi khi ghi tệp JSON:", error);
  }
};

readDataFromFile();

const generateContentWithAPI = async (apiKey, fullPrompt) => {
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: Model_Name, generationConfig });

    const result = await model.generateContent([{ text: fullPrompt }]);
    const response = await result.response;
    const text = await response.text();
    return text;
  } catch (error) {
    console.error("Lỗi khi sử dụng API:", error);
    throw error;
  }
};

const calculateDelay = (text) => {
  const words = text.split(" ").length;
  const delay = Math.min(words * 100, 5000); 
  return delay;
};

const pathFile = __dirname + '/cache/txt/autoseen.txt';

module.exports = {
  name: "AI",
  info: "Tạo văn bản bằng AI",
  dev: "HNT",
  onPrefix: true,
  dmUser: false,
  nickName: ["AI"],
  usages: "AI [prompt]",

  onEvents: async function ({ api, event }) {
    if (event.type !== 'message' || !event.body) {
      return;
    }

    const { senderID } = event;
    const prompt = event.body.trim();

    if (!prompt) return;

    try {
      if (!Array.isArray(conversationHistory[senderID])) {
        conversationHistory[senderID] = [];
      }

      conversationHistory[senderID].push(`User: ${prompt}`);

      const importantKeywords = [
        "thích", "sở thích", "địa điểm", "kỷ niệm", 
        "tình yêu", "gia đình", "công việc", "học tập", 
        "mục tiêu", "dự định", "sự kiện", "quyết định" 
      ];

      const isImportantMessage = importantKeywords.some(keyword => prompt.includes(keyword));

      if (isImportantMessage) {
        conversationHistory[senderID].push(`Important: ${prompt}`);
      }

      const context = conversationHistory[senderID].join("\n");
      const fullPrompt = `${systemInstruction}\n${context}`;

      let responseText = '';
      for (const apiKey of API_KEYS) {
        try {
          responseText = await generateContentWithAPI(apiKey, fullPrompt);
          break;
        } catch (error) {
          console.error(`API Key ${apiKey} gặp lỗi. Thử API Key khác...`);
        }
      }

      if (!responseText) {
        throw new Error("Tất cả các API đều gặp lỗi.");
      }

      conversationHistory[senderID].push(`${responseText}`);

      await saveDataToFile();

api.sendTypingIndicator(event.threadID, true); 

setTimeout(async () => {
  api.sendTypingIndicator(event.threadID, false);
  if (!fs.existsSync(pathFile))
    fs.writeFileSync(pathFile, 'false');
  const isEnable = fs.readFileSync(pathFile, 'utf-8');

  if (isEnable == 'true') {
    setTimeout(() => {
      api.markAsReadAll(() => {});
    }, 10000);
  } 

  const delay = calculateDelay(responseText);
  setTimeout(async () => {
    await api.sendMessage(responseText, event.threadID);
  }, delay);

}, 10000); 


    } catch (error) {
      console.error("Lỗi khi tạo nội dung:", error);
      return await api.sendMessage("⚠️ GPU quá tải, vui lòng thử lại sau.", event.threadID);
    }
  }
};
