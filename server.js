const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
let SerialPort = require('serialport');
const Readline = require('parser-readline');
const Tune = require("./src2/Tune");
let comport = "";

SerialPort.list(function (err, port) {
    for (let i in port) {
        const p = port[i];
        if (p.comName.match(/usbserial/) || p.comName.match(/COM/)) {
            comport = p.comName;
            break;
        }
    }
    ready();
})

app.get(`/*`, (req, res) => {
    res.sendFile(`${__dirname}/src${req.url}`);
});
let globalScoket;
let port;
let parser;

let ready = function () {
    io.on('connection', (socket) => {
        globalScoket = socket;
        port = new SerialPort(comport, {
            baudRate: 230400
        }, function (e) {
            if (e) {
                console.log("comport access dinied");
            } else {
                console.log("connect");
            }
        });
        parser = port.pipe(new Readline({
            delimiter: '\r\n'
        }))
        socket.on('disconnect', function () {
            port.close(function () {
                log("closed");
            });
        });
        parser.on('data', function (data) {
            // console.log(data);
            if (globalScoket) {
                globalScoket.emit('message', {
                    message: data
                }, function (res) {});
            }
        });

        socket.on("slalom", function (data) {
            if (data.velocity > 0) {
                var sla = new Slalom(data);
                var result = sla.exe();
                globalScoket.emit('slalom', result, function (res) {});
            }
        });
        socket.on("sci", function (data) {
            // console.log(data.target);
            let key = data.target ? data.target : "10000";
            let val = data.value; // data.value;
            port.write(`{${key}:${val}}`, function () {
                console.log("send");
            });
        });
        socket.on("update", function (res) {
            if (res) {
                Tune.update(res, port);
            }
        });
        socket.on("update2", function (data) {
            if (data) {
                Tune.update2(data, port);
            }
        });

        socket.on("load", function (target) {
            if (target) {
                Tune.load(target, socket);
            }
        });
    });
}

http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});


var sendEnable = true;

function log(data) {
    console.log(data);
}
