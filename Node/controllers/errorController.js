const AppError = require('../utils/appError');

const handleCastErrorDb = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new AppError(message, 400);
};

const handleDuplicateFieldsDb = (err) => {
  console.log('Reached here');
  const value = err.keyValue.email;
  const message = `Duplicate field Value: ${value}. please use another email`;
  return new AppError(message, 400);
};

const handleRequiredField = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);

  // const message = `${err.message.charAt(0).toUpperCase()}${err.message.slice(
  // 1
  // )}`;
  const message = `Invalid Input Data. ${errors.join('. ')}`;

  return new AppError(message, 401);
};

const handleValidationErrorDB = (err) => {
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid Input Data. ${errors.join('. ')}`;
  return new AppError(message, 400);
};

const handleJWTError = () =>
  new AppError('Invalid token, please log in again', 401);

const handleJWTExpiredError = () =>
  new AppError('Your Token has Expired. please Log in again', 401);

const sendErrorDev = (err, res) => {
  // console.log(err);
  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
    stack: err.stack,
    error: err,
  });
};
const sendErrorProd = (err, res) => {
  // Operational, trusted error -send to client
  if (err.isOperational) {
    console.log('error is operational');
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });
    // Programming or other unkown error
  } else {
    // 1) Log Error
    console.error('Error ♋ ', err);
    res.status(500).json(err);
    // 2) send generic message
    res.status(500).json({
      status: 'error',
      message: 'Something weird happened',
    });
  }
};

module.exports = (err, req, res, next) => {
  console.log(err);
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';
  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === 'production') {
    let error = { ...err };
    // console.log('The Error: ', error);
    error.message = err.message;
    if (error.kind === 'ObjectId') error = handleCastErrorDb(error);

    if (error.kind === 'required') {
      console.log('CNEr here');
      error = handleRequiredField(error);
    }
    if (error.code === 11000) error = handleDuplicateFieldsDb(error);

    if (error.name === 'validationError')
      error = handleValidationErrorDB(error);

    if (error.name === 'JsonWebTokenError') error = handleJWTError();

    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, res);
  }
};
