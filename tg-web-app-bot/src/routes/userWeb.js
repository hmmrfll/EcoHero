const express = require('express');
const User = require('../models/user'); // Убедитесь, что путь к вашей модели User правильный

const router = express.Router();

// Маршрут для получения топ доноров
router.get('/top-donors', async (req, res) => {
    console.log('Запрос на получение топ доноров');
    try {
        const topDonors = await User.find().sort({ donated: -1 }).limit(10);
        res.json(topDonors);
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для получения данных пользователя по chatId
router.get('/:chatId', async (req, res) => {
    console.log(`Запрос на получение данных для chatId: ${req.params.chatId}`);
    try {
        const user = await User.findOne({ chatId: req.params.chatId });
        if (user) {
            console.log('Пользователь найден:', user);
            res.json(user);
        } else {
            console.log('Пользователь не найден');
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для получения chatId по username
router.get('/chat-id/:username', async (req, res) => {
    console.log(`Запрос на получение chatId для username: ${req.params.username}`);
    try {
        const user = await User.findOne({ username: req.params.username });
        if (user) {
            console.log('Пользователь найден:', user);
            res.json({ chatId: user.chatId });
        } else {
            console.log('Пользователь не найден');
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для получения данных о пожертвованиях по username
router.get('/donations/:username', async (req, res) => {
    try {
        const { username } = req.params;
        const user = await User.findOne({ username: username });

        if (user) {
            const allUsers = await User.find().sort({ donated: -1 });
            const rank = allUsers.findIndex(u => u.username === username) + 1;

            res.json({ donated: user.donated, profilePhoto: user.profilePhoto, username: user.username, rank: rank });
        } else {
            res.status(404).send('Пользователь не найден');
        }
    } catch (error) {
        res.status(500).send(error);
    }
});

// Маршрут для запуска фарминга
router.post('/start-farming', async (req, res) => {
    const { chatId } = req.body;
    try {
        const user = await User.findOne({ chatId });
        if (user) {
            user.farmingStartTime = new Date();
            await user.save();
            res.json({ success: true, farmingStartTime: user.farmingStartTime });
        } else {
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для получения статуса фарминга
router.get('/farming-status/:chatId', async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.chatId });
        if (user) {
            res.json({ farmingStartTime: user.farmingStartTime });
        } else {
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для обновления монет ECHA
router.post('/update-echa', async (req, res) => {
    const { chatId, echaCoins } = req.body;
    try {
        const user = await User.findOne({ chatId });
        if (user) {
            user.echaCoins += echaCoins;
            user.farmingStartTime = null; // Сброс времени начала фарминга
            await user.save();
            res.json({ success: true, echaCoins: user.echaCoins });
        } else {
            res.status(404).json({ error: 'Пользователь не найден' });
        }
    } catch (error) {
        console.error('Ошибка:', error);
        res.status(500).json({ error: 'Внутренняя ошибка сервера' });
    }
});

// Маршрут для получения рефералов по chatId
router.get('/referrals/:chatId', async (req, res) => {
    const { chatId } = req.params;
  
    try {
      const user = await User.findOne({ chatId });
      if (user) {
        const referralUsernames = user.referrals;
        res.status(200).json({ referrals: referralUsernames });
      } else {
        res.status(404).json({ message: 'User not found' });
      }
    } catch (error) {
      console.error('Error fetching referrals:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  
module.exports = router;
