const dotenv = require('dotenv');
const mongoose = require('mongoose');

process.on('uncaughtException', (err) => {
  console.log('This is causing the error: ', err);
  console.log(err.name, err.message);
  process.exit(1);
});

// require("dotenv/config");
dotenv.config({ path: '.env' });
const app = require('./app.js');

const DB = process.env.DATABASE;
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('DB connected successfully!');
  });

const PORT = process.env.PORT || 8000 || 80;

const server = app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log('App listening on port %s', server.address().port, '...');
});

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
