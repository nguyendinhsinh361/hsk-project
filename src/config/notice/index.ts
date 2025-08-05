// Cài đặt thư viện trước: npm install node-telegram-bot-api
const TelegramBot = require('node-telegram-bot-api');

// const CONFIG_1 = {
//     bot_token: '7740072363:AAGJvUDKO8oNauIxFhiuWVlB8pC4HLDxIrM',
//     chat_id: '-1002361032551'
// };

const CONFIG_1 = {
    bot_token: '6437975673:AAFn_XSYiyuxJUklPr7OmXu8H0OyaU5MnDE',
    chat_id: '-1002184879797'
};

const CONFIG_2 = {
    bot_token: '7935258917:AAF5Htll22j7Z-_2LSvNVeyJOLsdYe2SRtI',
    chat_id: '-4619109007'
};






// Khởi tạo bot với token
const BOT_1 = new TelegramBot(CONFIG_1.bot_token);
const BOT_2 = new TelegramBot(CONFIG_2.bot_token);

// Hàm gửi thông báo
export const sendTelegramNotification = async (message, type = "BANK") => {
    try {
        if (type == "BANK") {
            await BOT_1.sendMessage(CONFIG_1.chat_id, message);
            await BOT_2.sendMessage(CONFIG_2.chat_id, message);
        }
        if (type == "IAP") {
            await BOT_2.sendMessage(CONFIG_2.chat_id, message);
        }
    } catch (error) {
        console.error('Lỗi khi gửi thông báo:', error);
    }
}
