const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const crypto = require('crypto');
const { createCanvas } = require('canvas');
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
const webAppUrl = "https://8e94-212-98-175-54.ngrok-free.app";
const communityAppUrl = "https://t.me/pisarevich";

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const username = msg.from.username || msg.from.first_name || msg.from.last_name || 'User';
    const text = msg.text;

    let profilePhoto = '';

    try {
        const userProfile = await bot.getUserProfilePhotos(msg.from.id);
        if (userProfile.photos.length > 0) {
            const fileId = userProfile.photos[0][0].file_id;
            const file = await bot.getFile(fileId);
            profilePhoto = `https://api.telegram.org/file/bot${token}/${file.file_path}`;
        } else {
            profilePhoto = createProfileImage(username.charAt(0).toUpperCase());
        }
    } catch (error) {
        console.error('Error fetching user profile photo:', error);
        profilePhoto = createProfileImage(username.charAt(0).toUpperCase());
    }

    if (text.startsWith("/start")) {
        const refCodeMatch = text.match(/\/start (.+)/);
        const referrerReferralCode = refCodeMatch ? refCodeMatch[1].replace('ref_', '') : null;

        let user = await User.findOne({ chatId });

        if (!user) {
            const referralCode = generateReferralCode();

            const newUser = new User({
                chatId,
                username,
                profilePhoto,
                referralCode,
                referrerChatId: null,
                referralId: null, // Инициализируем referralId как null по умолчанию
                balance: 0,       // Инициализируем баланс
                donated: 0,       // Инициализируем пожертвованные средства
                echaCoins: 0      // Инициализируем монеты ECHA
            });

            if (referrerReferralCode) {
                const referrer = await User.findOne({ referralCode: referrerReferralCode });

                if (referrer && referrer.chatId !== chatId) {
                    newUser.referrerChatId = referrer.chatId;
                    newUser.referralId = referrer._id; // Устанавливаем referralId
                    await bot.sendMessage(referrer.chatId, `Finally! @${username} joined your Web3 hub on EPIC!`);
                }
            }

            user = await newUser.save();
        } else if (referrerReferralCode && !user.referralId) {
            const referrer = await User.findOne({ referralCode: referrerReferralCode });

            if (referrer && referrer.chatId !== chatId) {
                user.referrerChatId = referrer.chatId;
                user.referralId = referrer._id;
                await bot.sendMessage(referrer.chatId, `Finally! @${username} joined your Web3 hub on EPIC!`);
                user = await user.save();
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

        await bot.sendMessage(chatId, `Hey @${username}! ${invitationMessage}`, replyMarkup);
    }
});

function generateReferralCode() {
    return crypto.randomBytes(4).toString('hex');
}

function createProfileImage(letter) {
    const canvas = createCanvas(100, 100);
    const ctx = canvas.getContext('2d');

    // Background color
    ctx.fillStyle = '#4c657d';
    ctx.fillRect(0, 0, 100, 100);

    // Text
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 50px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(letter, 50, 50);

    return canvas.toDataURL();
}
