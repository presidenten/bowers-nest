var http = require('http');
var __request = http.request;
exports.request = __request;

var proxy = {
    host: '',
    port: 0
};

var _debug = false;

http.request = function (options, callback) {
    var __options = options;
    __options.path = 'http://' + options.host + options.path;
    __options.host = proxy.host;
    __options.port = proxy.port;
    if (_debug) {
        console.log('=== http-proxy.js begin debug ===');
        console.log(JSON.stringify(__options, null, 2));
        console.log('=== http-proxy.js end debug ===');
    }
    var req = __request(__options, function (res) {
        callback(res);
    });
    return req;
};

module.exports = function (host, port, debug) {
    proxy.host = host;
    proxy.port = port;
    _debug = debug || false;
};