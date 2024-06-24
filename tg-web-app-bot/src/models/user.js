const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    chatId: { type: Number, unique: true },
    referralCode: { type: String, unique: true },
    referrerChatId: Number
});

const User = mongoose.model('User', userSchema);

module.exports = User;
