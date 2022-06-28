const express = require('express');
const cors = require('cors');

// const userRouter = require('./routes/userRoute');
const globalErrorHandler = require('./controllers/errorController');
const traineeRouter = require('./routes/traineeRoute');
const nftRouter = require('./routes/nftRoute');
const nftRouter2 = require('./routes/nftRoute2');

const app = express();

// enable cors to accept ip address from client
let corsOptions = {
  origin: '*',
  optionsSuccessStatus: 200,
};

// Global Middleware
// enable cors
app.use(cors(corsOptions));

// body parser
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Pls wew',
  });
});

app.use('/api/v1/trainees', traineeRouter);
app.use('/api/v1/nft', nftRouter);
app.use('/api/v2/nft', nftRouter2);

// app.use('/api/v1/users', userRouter);

app.use(globalErrorHandler);

module.exports = app;
