const express = require('express');
const User = require('../models/user'); // Убедитесь, что путь правильный

const router = express.Router();

router.get('/top-donors', async (req, res) => {
    console.log('Received request for top donors');
    try {
        const topDonors = await User.find().sort({ donated: -1 }).limit(10);
        res.json(topDonors);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Маршрут для получения данных пользователя по chatId
router.get('/:chatId', async (req, res) => {
    console.log(`Received request for chatId: ${req.params.chatId}`);
    try {
        const user = await User.findOne({ chatId: req.params.chatId });
        if (user) {
            console.log('User found:', user);
            res.json(user);
        } else {
            console.log('User not found');
            res.status(404).json({ error: 'User not found' });
        }
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Маршрут для получения chatId пользователя из initData
router.post('/', async (req, res) => {
    try {
        const { initData } = req.body;
        const userData = JSON.parse(initData);
        const chatId = userData.id;

        if (chatId) {
            const user = await User.findOne({ chatId });
            if (user) {
                res.json({ chatId: user.chatId });
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } else {
            res.status(400).json({ error: 'Invalid initData' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Маршрут для получения данных о пожертвованиях пользователя по telegramUsername
router.get('/donations/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username });

        if (user) {
            // Получаем всех пользователей, отсортированных по количеству пожертвований
            const allUsers = await User.find().sort({ donated: -1 });

            // Находим индекс текущего пользователя в отсортированном массиве (это и есть его ранг)
            const rank = allUsers.findIndex(u => u.username === username) + 1;

            res.json({ donated: user.donated, profilePhoto: user.profilePhoto, username: user.username, rank: rank });
        } else {
            res.status(404).send('User not found');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});


module.exports = router;
