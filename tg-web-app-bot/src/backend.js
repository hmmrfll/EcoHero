const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userWeb');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3002;

connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/users', userRoutes);

app.listen(port, () => {
    console.log(`Server is running at http://77.111.247.55:${port}`);
});
