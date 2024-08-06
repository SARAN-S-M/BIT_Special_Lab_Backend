require('dotenv').config();

const port = process.env.PORT || 5000;

const dbConnect = require('./dbConnect');
dbConnect();

const http = require('http');

const app = require('./src/app.js');

// import app from './src/app.js';

const server = http.createServer(app);

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
});