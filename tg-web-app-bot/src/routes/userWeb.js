const express = require('express');
const router = express.Router();
const User = require('../models/userWeb');

// Получение данных пользователя
router.get('/:username', async (req, res) => {
    try {
        const user = await User.findOne({ username: req.params.username });
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Обновление данных пользователя
router.put('/:username', async (req, res) => {
    try {
        const user = await User.findOneAndUpdate(
            { username: req.params.username },
            { $set: req.body },
            { new: true }
        );
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Создание начального пользователя
router.post('/initialize', async (req, res) => {
    try {
        const newUser = new User({
            username: req.body.username,
            fullName: req.body.fullName,
            bio: req.body.bio,
            profileImage: req.body.profileImage,
            descriptions: [],
            xLink: '',
            linkedIn: '',
            companies: [],
            price: 0,
            balance: 0,
            tasks: [
                { name: 'Fill your profile', points: 50, completed: false },
                { name: 'Respond to other users’ requests', points: 100, completed: false },
                { name: 'Invite friends', points: 100, completed: false },
                { name: 'Claim daily reward', points: 100, completed: false },
                { name: 'Follow Epic Connect', points: 50, completed: false }
            ]
        });
        const user = await newUser.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
