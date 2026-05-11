const createMediaError = (message, code = "INVALID_ARGUMENT") => {
  const error = new Error(message);
  error.code = code;
  return error;
};

module.exports = {
  createMediaError
};
