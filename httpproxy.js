var http  = require('http')
var url   = require('url')
var net   = require('net')
var fs    = require('fs')
var https = require('https')

function handleRequest(request, response) {
    var u = url.parse(request.url);
    var options = {
        hostname: u.hostname,
        port:     u.port || 80,
        path:     u.path,
        method:   request.method,
        headers:  request.headers,
    }

    var rep = http.request(options, function(res) {
        response.writeHead(res.statusCode, res.headers);
        res.pipe(response)
    }).on('error', function(e) {
        response.end();
    });

    request.pipe(rep);
}

function connect(request, sock1) {
    var u = url.parse('http://' + request.url);

    var sock2 = net.connect(u.port, u.hostname, function() {
        sock1.write('HTTP/1.1 200 Connection Established\r\n\r\n');
        sock2.pipe(sock1);
    }).on('error', function(e) {
        sock1.end();
    });
    sock1.pipe(sock2);
}

// 生成证书并信任（Common Name 写 127.0.0.1）
// openssl genrsa -out private.pem 2048
// openssl req -new -x509 -key private.pem -out public.crt -days 99999
// var options = {
//     key:  fs.readFileSync('./private.pem'),
//     cert: fs.readFileSync('./public.pem')
// }

// 普通代理
// http.createServer(handleRequest).listen(8889, "0.0.0.0")

// 隧道代理
http.createServer().on('request', handleRequest)
                   .on('connect', connect)
                   .listen(8777, "0.0.0.0")

// https（未调通）
// https.createServer(options).on('request', handleRequest)
//                            .on('connect', connect)
//                            .listen(8889, "0.0.0.0")
