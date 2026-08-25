require('dotenv').config();

const express = require('express');

const healthRoutes = require('./modules/health/health.routes');

const app = express();

app.use(express.json());

app.use('/health', healthRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`API running on port ${port}`);
});