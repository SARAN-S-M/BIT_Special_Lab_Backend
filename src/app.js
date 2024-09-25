const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
    origin: ['http://localhost:3000', 'https://bit-special-lab-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));

const UserRoutes = require('./User/index.js');
const SpeicalLabRoutes = require('./SpecialLabs/index.js');

app.use('/api/user', UserRoutes);
app.use('/api/speciallabs', SpeicalLabRoutes);

module.exports = app;