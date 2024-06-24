const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userWeb');

const app = express();
const port = 3000;

connectDB();

app.use(express.json());

// Маршруты пользователя
app.use('/api/users', userRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
