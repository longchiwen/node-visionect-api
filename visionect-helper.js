// logger that writes to console
var consoleLogger = {
  log: function() {
    console.log.apply(this, arguments);
  },
  info: function() {
    console.info.apply(this, arguments);
  },
  warn: function() {
    console.warn.apply(this, arguments);
  },
  error: function() {
    console.error.apply(this, arguments);
  }
};

// logger that silences all output
var voidLogger = {
  log: function() {
    // suppress output
  },
  info: function() {
    // suppress output
  },
  warn: function() {
    // suppress output
  },
  error: function() {
    // suppress output
  }
};

var visionectHelper = {
  getAuthorization: getAuthorization,
  setApiKey: setApiKey,
  getApiKey: getApiKey,
  setApiSecret: setApiSecret,
  getApiSecret: getApiSecret,
  setHost: setHost,
  getHost: getHost,
  setPort: setPort,
  getPort: getPort,
  setProtocol: setProtocol,
  getProtocol: getProtocol,
  _apiKey: "",
  _apiSecret: "",

  // write to console by default
  _logger: consoleLogger
};

module.exports = visionectHelper;

var crypto = require("crypto"),
  util = require("util");

function getAuthorization(path, method, contentType, date) {
  var auth = crypto
    .createHmac("sha256", this.getApiSecret())
    .update(
      util.format("%s\n%s\n%s\n%s\n%s", method, "", contentType, date, path)
    )
    .digest("base64");
  return (authorizaton = util.format("%s:%s", this.getApiKey(), auth));
}

function setApiKey(apiKey) {
  this._apiKey = apiKey;
}

function getApiKey() {
  return this._apiKey;
}

function setApiSecret(apiSecret) {
  this._apiSecret = apiSecret;
}

function getApiSecret() {
  return this._apiSecret;
}

function setHost(host) {
  this._host = host;
}

function getHost() {
  return this._host;
}

function setPort(port) {
  this._port = port;
}

function getPort() {
  return this._port;
}

function setLogger(logger) {
  this._logger = logger;
}

function getLogger() {
  return this._logger || voidLogger;
}

function setProtocol(protocol) {
  this._protocol = protocol;
}

function getProtocol() {
  return this._protocol || "http";
}
