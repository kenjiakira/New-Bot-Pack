const axios = require('axios');
const translate = require('translate-google');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const OPENWEATHER_API_KEY = "1230a8fdc6457603234c68ead5f3f967";
const OPENWEATHER_URL = "https://api.openweathermap.org/data/2.5/weather";

const ACCUWEATHER_API_KEY = "0Ux14sE88TUCC0vALojkwlWP47fjmIdK";
const ACCUWEATHER_URL = "http://dataservice.accuweather.com/currentconditions/v1/";

const API_KEYS = [
"AIzaSyDSFQTodWCEVU6GI8LBxczmviEPdWlnoao"
];

async function getWeatherFromOpenWeather(cityName) {
    const params = {
      q: cityName,
      appid: OPENWEATHER_API_KEY,
      units: "metric"
    };
  
    try {
      const response = await axios.get(OPENWEATHER_URL, { params });
      return response.data;
    } catch (error) {
      console.error(`Lỗi khi gọi OpenWeather API: ${error.response ? error.response.data.message : error.message}`);
      throw new Error("Không tìm thấy thông tin thời tiết từ OpenWeatherMap.");
    }
  }
  
  async function getWeatherFromAccuWeather(cityKey) {
    try {
      const response = await axios.get(`${ACCUWEATHER_URL}${cityKey}?apikey=${ACCUWEATHER_API_KEY}`);
      return response.data[0];
    } catch (error) {
      console.error(`Lỗi khi gọi AccuWeather API: ${error.response ? error.response.data.message : error.message}`);
      throw new Error("Không tìm thấy thông tin thời tiết từ AccuWeather.");
    }
  }
  
  async function guessCityName(cityName) {
    let guessedCityName = cityName;
  
    for (let i = 0; i < API_KEYS.length; i++) {
      const genAI = new GoogleGenerativeAI(API_KEYS[i]);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
      const prompt = `
        Đoán tên thành phố hoặc khu vực chính xác dựa trên đầu vào: "${cityName}".
        Đề xuất tên chính xác hoặc gần đúng.
      `;
  
      try {
        const result = await model.generateContent([{ text: prompt }]);
        guessedCityName = result.response.text().trim();
        break;  
      } catch (error) {
        console.error(`Lỗi khi sử dụng API Gemini với API key thứ ${i + 1}:`, error);
        if (i === API_KEYS.length - 1) {
          console.warn("Tất cả API keys đã chết, quay lại sử dụng API gốc.");
          return null; 
        }
      }
    }
  
    return guessedCityName;
  }
  
  async function getCityKey(cityName) {
  
    try {
      const response = await axios.get(`http://dataservice.accuweather.com/locations/v1/cities/search?apikey=${ACCUWEATHER_API_KEY}&q=${encodeURIComponent(cityName)}`);
      if (response.data.length > 0) {
        return response.data[0].Key;
      } else {
        throw new Error("Không tìm thấy mã thành phố trong AccuWeather.");
      }
    } catch (error) {
      console.error(`Lỗi khi tìm mã thành phố từ AccuWeather: ${error.response ? error.response.data.message : error.message}`);
      throw new Error("Không thể tìm mã thành phố từ AccuWeather.");
    }
  }
  
  async function generateWeatherDescription(weatherData, source) {
    let description = '';
  
    for (let i = 0; i < API_KEYS.length; i++) {
      const genAI = new GoogleGenerativeAI(API_KEYS[i]);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
  
      const shortPrompt = `
        Hãy tạo một đoạn mô tả ngắn gọn và hấp dẫn về thời tiết hiện tại tại ${weatherData.name}, với các thông tin:
        - Mô tả thời tiết: ${weatherData.weather[0]?.description || "Không có mô tả"}
        - Nhiệt độ: ${weatherData.main?.temp || weatherData.Temperature.Metric.Value}°C
        - Độ ẩm: ${weatherData.main?.humidity || weatherData.RelativeHumidity}%
        - Tốc độ gió: ${weatherData.wind?.speed || weatherData.Wind.Speed.Metric.Value} m/s
        
        Dùng phong cách vui vẻ, thêm emoji và viết như một người dẫn chương trình thời tiết.
      `;
  
      try {
        const result = await model.generateContent([{ text: shortPrompt }]);
        description = result.response.text();
        break; 
      } catch (error) {
        console.error(`Lỗi khi sử dụng API Gemini với API key thứ ${i + 1}:`, error);
        if (i === API_KEYS.length - 1) {
          console.warn("Tất cả API keys đã chết, quay lại sử dụng API gốc.");
          return `Thời tiết tại ${weatherData.name} hiện tại không thể mô tả chính xác bằng AI, xin vui lòng thử lại sau.`;
        }
      }
    }
  
    return description;
  }

module.exports = {
  name: "weather",
  dev: "Akira, HNT",
  info: "Tra cứu thông tin thời tiết và thông báo tự động với mô tả từ AI",
  onPrefix: true,
  dmUser: false,
  usages: "weather [tên thành phố]",
  cooldowns: 5,
  dependencies: {
    "@google/generative-ai": ""
  },


onLaunch: async function({ api, event, target }) {
  const cityName = target.join(" ");
  if (!cityName) {
    return api.sendMessage("🌍 Bạn chưa nhập tên thành phố/khu vực cần tra cứu thời tiết.", event.threadID);
  }

  try {
    let translatedCityName = cityName;
    if (!/^[a-zA-Z\s]+$/.test(cityName)) { 
      try {
        translatedCityName = await translate(cityName, { to: "en" });
        if (typeof translatedCityName === 'object' && translatedCityName.text) {
          translatedCityName = translatedCityName.text;
        }
      } catch (error) {
        return api.sendMessage("Có lỗi xảy ra khi dịch tên thành phố. Vui lòng kiểm tra lại.", event.threadID);
      }
    }

    let weatherData;
    try {

      weatherData = await getWeatherFromOpenWeather(translatedCityName);
    } catch (error) {
      console.warn("Không tìm thấy thành phố từ OpenWeatherMap, đang thử AccuWeather...");

      let cityKey;
      try {

        cityKey = await getCityKey(translatedCityName);

        weatherData = await getWeatherFromAccuWeather(cityKey);
      } catch (accuWeatherError) {
        console.error("Không tìm thấy thành phố từ AccuWeather:", accuWeatherError);
        throw new Error("Không thể lấy dữ liệu thời tiết từ cả OpenWeatherMap và AccuWeather.");
      }
    }

    if (!weatherData || (!weatherData.weather && !weatherData.main)) {
      return api.sendMessage("❗ Không thể lấy dữ liệu thời tiết. Vui lòng thử lại sau.", event.threadID);
    }

    const weatherDescription = await generateWeatherDescription(weatherData);

    api.sendMessage(weatherDescription, event.threadID);
  } catch (error) {
    api.sendMessage("⚠️ Có lỗi xảy ra khi lấy thông tin thời tiết. Vui lòng thử lại sau.", event.threadID);
  }
},

  onLoad: function({ api }) {
  const now = new Date();
  const vietnamTimezoneOffset = 7 * 60 * 60 * 1000;
  const localTime = new Date(now.getTime() + vietnamTimezoneOffset);
  
  const minutesUntilNextHour = 60 - localTime.getMinutes();
  const msUntilNextHour = (minutesUntilNextHour * 360 + (360 - localTime.getSeconds())) * 1000; 

  console.log(`Đang chờ ${msUntilNextHour} ms để thông báo vào giờ tiếp theo.`);

  setTimeout(() => {
      console.log('Gửi thông báo thời tiết đầu tiên.');
      notifyWeather(api); 
      setInterval(() => {
          console.log('Gửi thông báo thời tiết mỗi giờ.');
          notifyWeather(api); 
      }, 360 * 60 * 1000);
  }, msUntilNextHour);
 } 
};