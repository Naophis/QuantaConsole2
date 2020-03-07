const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
let SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');
const Tune = require("./src2/Tune");
let comport = "";

SerialPort.list().then((ports) => {
        for (let i in ports) {
            const p = ports[i];
            console.log(p.path, p.serialNumber);
            if (p.path.match(/usbserial/) || p.path.match(/COM/) || p.path.match(/ttyUSB/)) {
                if (p.serialNumber) {
                    comport = p.path;
                    console.log(`select: ${comport}`);
                    ready();
                    break;
                }
            }
        }
    },
    err => console.error(err)
);
app.get(`/*`, (req, res) => {
    res.sendFile(`${__dirname}/src${req.url}`);
});
let globalScoket;
let port;
let parser;

let ready = function () {
    io.on('connection', (socket) => {
        globalScoket = socket;
        if (!port) {
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
            }));
        }
        socket.on('disconnect', function () {
            if (port) {
                port.close(function () {
                    log("closed");
                    port = undefined;
                });
            }
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

        socket.on("all_write", function (target) {
            Tune.all_write(target, port);
        });
        socket.on("all_write2", function (target) {
            console.log("server recieve")
            Tune.all_write2(target, port);
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