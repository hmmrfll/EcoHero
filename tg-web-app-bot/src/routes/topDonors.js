const express = require('express');
const User = require('../models/user'); // Подставьте правильный путь к модели User

const router = express.Router();

// Маршрут для получения топ-10 доноров
router.get('/', async (req, res) => {
    try {
        const topDonors = await User.find().sort({ donated: -1 }).limit(10);
        res.json(topDonors);
    } catch (error) {
        console.error('Error fetching top donors:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;
