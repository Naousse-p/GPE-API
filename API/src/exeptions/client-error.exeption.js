// src/exeptions/ClienError.js
class ClientError extends Error {
  constructor(message, httpCode = 500) {
    super(message);
    this.status = httpCode;
  }
}

export default ClientError;
