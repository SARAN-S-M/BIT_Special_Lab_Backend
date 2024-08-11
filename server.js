require('dotenv').config();
const cors = require('cors');

const port = process.env.PORT || 5000;

const dbConnect = require('./dbConnect');
dbConnect();



// const http = require('http');

const app = require('./src/app.js');

app.use(cors({
    origin: ['http://localhost:3000', 'https://bit-special-lab-frontend.vercel.app'],
    methods: ['GET', 'POST', 'PUT'],
    credentials: false,
}));

// import app from './src/app.js';

// const app = http.createServer(app);

// app.listen(port, () => {
//     console.log(`Server running on port ${port}`);
// });

export default app;