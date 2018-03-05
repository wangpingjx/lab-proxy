var net = require('net');

var server = net.createServer(function(socket) {
    socket.on("error", (err) => {
        console.log(err)
    })

    socket.once("data", (handShake) => {
        var handShakeBinary = new Buffer(handShake, 'binary')

        if(handShakeBinary[0] == 0x05) {
            var handShakeResponse = new Buffer(2);
            handShakeResponse[0]  = 0x05;
            handShakeResponse[1]  = 0x00;
            socket.write(handShakeResponse);

            socket.once('data', (clientRequest) => {
                var len = clientRequest.length
                var requestData = new Buffer(clientRequest, 'binary')

                switch (requestData[3]) {
                    case 0x01: // IPv4
                        var host = requestData.slice(4, 7).toString();
                        break;
                    case 0x03: // 域名
                        var host = requestData.slice(5, -2).toString();
                        break
                    case 0x04: // IPv6
                        var host = requestData.slice(4, 19).toString();
                        break;
                }
                var port = (parseInt(requestData[len-2]) << 8 | parseInt(requestData[len-1])).toString()

                console.log("connect to " + host + ":" + port)

                var psocket = net.connect(port, host, function() {
                    var responseBinary = new Buffer([0x05, 0x00, 0x00, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00]);
                    socket.write(responseBinary)
                    psocket.pipe(socket)
                }).on('error', function(e) {
                    socket.end()
                });
                socket.pipe(psocket)
            })
        }
    })
});

server.listen(8777, '0.0.0.0');

server.on('error', (err) => {
    throw err;
});
