const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const User = require('./models/user'); // Подставьте свой путь к модели User

mongoose.connect('mongodb://localhost:27017/EpicConnect', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

const token = "7284707153:AAH3AirgAvA-oB6xlsmoORd3x0DNjxZrNc4";
const bot = new TelegramBot(token, { polling: true });
const webAppUrl = "https://7f37-212-98-175-246.ngrok-free.app";
const communityAppUrl = "https://t.me/pisarevich";

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;

    if (text.startsWith("/start")) {
        const refCodeMatch = text.match(/\/start (.+)/);
        const referrerReferralCode = refCodeMatch ? refCodeMatch[1].replace('ref_', '') : null;

        let user = await User.findOne({ chatId });

        if (!user) {
            const referralCode = generateReferralCode();
            console.log(`Referral link user ${chatId}: https://t.me/EpicConnectFatherBot?start=ref_${referralCode}`);

            const newUser = new User({
                chatId,
                referralCode,
                referrerChatId: null,
                referralId: null  // Инициализируем referralId как null по умолчанию
            });

            if (referrerReferralCode) {
                const referrer = await User.findOne({ referralCode: referrerReferralCode });

                if (referrer && referrer.chatId !== chatId) {
                    newUser.referrerChatId = referrer.chatId;
                    newUser.referralId = referrer._id;  // Устанавливаем referralId
                    await bot.sendMessage(referrer.chatId, `Finally! @${msg.from.username} joined your Web3 hub on EPIC!`);
                } else {
                    console.log('User attempted self-referral or invalid referral code');
                }
            }

            user = await newUser.save();
        } else if (referrerReferralCode && !user.referralId) {
            const referrer = await User.findOne({ referralCode: referrerReferralCode });

            if (referrer && referrer.chatId !== chatId) {
                user.referrerChatId = referrer.chatId;
                user.referralId = referrer._id;
                await bot.sendMessage(referrer.chatId, `Finally! @${msg.from.username} joined your Web3 hub on EPIC!`);
                user = await user.save();
            } else {
                console.log('User attempted self-referral or invalid referral code');
            }
        }

        const invitationMessage = user.referrerChatId
            ? `Welcome to Epic Connect — your hub for connecting with Web3 builders, investors, and professionals!\n\n- Complete your profile and start receiving requests from other professionals\n- Earn Ē points by responding to requests\n- Use your points to reach out to other Web3 professionals`
            : `Epic Connect is currently invite-only. Ask a friend for an invite to join.`;

        const replyMarkup = user.referrerChatId
            ? {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'GO!', web_app: { url: webAppUrl } }],
                        [{ text: 'Join Community!', url: communityAppUrl }]
                    ]
                }
            }
            : {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Join Community!', url: communityAppUrl }]
                    ]
                }
            };

        let username = msg.from.username ? `@${msg.from.username}` : '';

        await bot.sendMessage(chatId, `Hey ${username}! ${invitationMessage}`, replyMarkup);
    }
});

function generateReferralCode() {
    return crypto.randomBytes(4).toString('hex');
}

