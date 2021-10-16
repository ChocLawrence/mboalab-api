class ErrorHandler extends Error {
  constructor(statusCode, code, state, message) {
    super();
    this.statusCode = statusCode;
    this.code = code;
    this.state = state;
    this.message = message;
  }
}

const handleError = (err, res) => {
  let error = {};

  var { statusCode, code, state, message, stack, response } = err;
  statusCode = statusCode || 500;

  error.status = "error";

  if (statusCode) {
    error.statusCode = statusCode;
  }

  if (code) {
    error.code = code;
  }

  if (state) {
    error.state = state;
  }

  if (message) {
    error.message = message;
  }

  if (process.env.NODE_ENV === "test") {
    error.stack = stack;
  }

  if (response && response.data) {
    statusCode = response.status;
    error.statusCode = statusCode;
    error.message = response.data.usrMsg;
    error.code = response.data.respCode;
    error.state = 703990;
  }

  res.status(statusCode).json({
    error,
  });
};

const SuccessHandler = (res, status, statusCode, message, data) => {
  let result = {};

  if (status) {
    result.status = status;
  }

  if (statusCode) {
    result.statusCode = statusCode;
  }

  if (message) {
    result.message = message;
  }

  if (data) {
    result.value = data;
  }

  return res.status(statusCode).json({
    error: false,
    result: result,
  });
};

module.exports = {
  ErrorHandler,
  handleError,
  SuccessHandler,
};
