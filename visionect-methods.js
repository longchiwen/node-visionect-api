var visionectMethods = {
  visionectGetMethod: visionectGetMethod,
  visionectPutMethod: visionectPutMethod,
  visionectPostMethod: visionectPostMethod,
  visionectDeleteMethod: visionectDeleteMethod,
  visionectSendImage: visionectSendImage,
  visionectGetImageMethod: visionectGetImageMethod
};

module.exports = visionectMethods;

var helper = require("./visionect-helper"),
  http = require("http"),
  https = require("https"),
  util = require("util"),
  FormData = require("form-data"),
  fs = require("fs");

function getHttpClient(protocol) {
  if (protocol.indexOf("https") > -1) return https
  return http
}

function visionectRequest(path, method, contentType, body, expectedHttpCode) {
  var method = method ? method : "GET",
    contentType = contentType ? contentType : "application/json",
    expectedHttpCode = expectedHttpCode ? expectedHttpCode : 200,
    date = Date(),
    // strip get arguments from path
    cleanPath =
      path.indexOf("?") > -1 ? path.substr(0, path.indexOf("?")) : path;

  var authorization = helper.getAuthorization(
    cleanPath,
    method,
    contentType,
    date
  );

  var headers = {
    "content-type": contentType,
    Date: date,
    Authorization: authorization
  };

  body = body ? JSON.stringify(body) : null;

  httpClient = getHttpClient(helper.getProtocol())

  var request = httpClient.request({
    method: method,
    host: helper.getHost(),
    port: helper.getPort(),
    path: path,
    headers: headers,
    encoding: "binary"
  });

  helper
    .getLogger()
    .log(
      method,
      helper.getProtocol(),
      helper.getHost(),
      helper.getPort(),
      path,
      body,
      authorization,
      date
    );

  var promise = new Promise(function(resolve, reject) {
    // reject any request errors
    request.on("error", function(err) {
      reject(err);
    });

    // if request times out, emit an error and abort the request
    request.on("timeout", function() {
      request.emit("error", new Error("ETIMEDOUT"));
      request.abort();
    });

    request.on("response", function(response) {
      response.setEncoding("binary");
      var responseBody = "";
      if (response.statusCode != expectedHttpCode) {
        resolve("Error: " + response.statusCode);
      }
      response.on("data", function(chunk) {
        responseBody += chunk;
      });
      response.on("end", function() {
        resolve(responseBody);
      });

      // reject any response errors
      response.on("error", function(err) {
        reject(err);
      });
    });
  });

  // write the body and send the request after we are attached to events
  request.end(body);

  return promise;
}

function visionectSendImage(uuid, imageFile) {
  var imageStream = fs.createReadStream(imageFile);

  var form = new FormData();
  form.append("image", imageStream);
  var headers = form.getHeaders(),
    date = Date(),
    path = util.format("/backend/%s", uuid),
    method = "PUT";
  headers.Date = date;
  headers.Authorization = helper.getAuthorization(
    path,
    method,
    headers["content-type"],
    date
  );

  helper.getLogger().log(helper.getHost());

  httpClient = getHttpClient(helper.getProtocol())
  var request = httpClient.request({
    method: method,
    host: helper.getHost(),
    port: helper.getPort(),
    path: path,
    headers: headers
  });

  // helper.getLogger().log(util.inspect(form, {showHidden: false, depth: null}));

  helper.getLogger().log("uuid : ", uuid);
  helper.getLogger().log("host : ", helper.getHost());
  helper.getLogger().log("content-type : ", headers["content-type"]);
  helper.getLogger().log("apiKey : ", helper.getApiKey());
  helper.getLogger().log("apiSecret : ", helper.getApiSecret());
  helper
    .getLogger()
    .log(
      "requete url : ",
      helper.getProtocol() + "://" + helper.getHost() + ":" + "8081" + path
    );
  helper
    .getLogger()
    .log(
      "headers : ",
      util.inspect(headers, { showHidden: false, depth: null })
    );

  var promise = new Promise(function(resolve, reject) {
    form.pipe(request);

    request.on("response", function(res) {
      var body = "";
      if (res.statusCode != 200) {
        reject("Error: " + res.statusCode);
      }
      imageStream.on("error", function(err) {
        res.end("error imageStream : ", err);
      });
      res.on("data", function(chunk) {
        helper.getLogger().log("chocolate ", chunk);
        body += chunk;
      });
      res.on("end", function() {
        helper.getLogger().log("end : " + body);
        resolve(body);
      });
    });
  });
  return promise;
}

function visionectGetMethod(path, expectedHttpCode, contentType) {
  return visionectRequest(path, "GET", contentType, null, expectedHttpCode);
}

function visionectPutMethod(path, body, expectedHttpCode, contentType) {
  return visionectRequest(path, "PUT", contentType, body, expectedHttpCode);
}

function visionectPostMethod(path, body, expectedHttpCode, contentType) {
  return visionectRequest(path, "POST", contentType, body, expectedHttpCode);
}

function visionectDeleteMethod(path, expectedHttpCode, contentType) {
  return visionectRequest(path, "DELETE", contentType, null, expectedHttpCode);
}

function visionectGetImageMethod(path, expectedHttpCode, contentType) {
  var method = method ? method : "GET",
    contentType = contentType ? contentType : "application/json",
    expectedHttpCode = expectedHttpCode ? expectedHttpCode : 200,
    date = Date(),
    // strip get arguments from path
    cleanPath =
      path.indexOf("?") > -1 ? path.substr(0, path.indexOf("?")) : path;

  var authorization = helper.getAuthorization(
    cleanPath,
    method,
    contentType,
    date
  );

  var headers = {
    "content-type": contentType,
    Date: date,
    Authorization: authorization
  };

  var options = {
    method: method,
    host: helper.getHost(),
    protocol: helper.getProtocol(),
    port: helper.getPort(),
    path: path,
    headers: headers
  };

  http.get(options, function(res) {
    var imagedata = "";
    res.setEncoding("binary");

    res.on("data", function(chunk) {
      imagedata += chunk;
    });

    res.on("end", function() {
      fs.writeFile("logo.png", imagedata, "binary", function(err) {
        if (err) throw err;
        helper.getLogger().log("File saved.");
      });
    });
  });
}
