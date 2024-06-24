const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: String,
    position: String
});

const taskSchema = new mongoose.Schema({
    name: String,
    points: Number,
    completed: { type: Boolean, default: false },
    lastCompleted: Date
});

const userSchema = new mongoose.Schema({
    fullName: String,
    bio: String,
    profileImage: String,
    descriptions: [String],
    xLink: String,
    linkedIn: String,
    companies: [companySchema],
    price: Number,
    balance: { type: Number, default: 0 },
    tasks: [taskSchema]
});

const User = mongoose.model('userWeb', userSchema);

module.exports = User;
