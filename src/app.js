require('dotenv').config();

const express = require('express');

const apiRoutes = require('./routes');

const app = express();

app.use(express.json());

app.use('/test', express.static('test'));

app.use('/api', apiRoutes);

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`API running on port ${port}`);
});