var fs = require('fs');
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 3000;
let SerialPort = require('serialport');
const Readline = require('parser-readline');
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
                }, function (res) { });
            }
        });

        socket.on("slalom", function (data) {
            if (data.velocity > 0) {
                var sla = new Slalom(data);
                var result = sla.exe();
                globalScoket.emit('slalom', result, function (res) { });
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
                console.log(res);
                var type = res.type;
                delete res.type;
                readFile("output.json", function (json) {
                    try {
                        var saveData = JSON.parse(json);
                        var savedDataList = saveData[type].list;
                        var head = true;
                        for (var i = 0; i < savedDataList.length; i++) {
                            if (savedDataList[i].id === res.id) {
                                savedDataList[i] = res;
                                saveData[type].list = savedDataList;
                                head = false;
                                writeFile("output.json", JSON.stringify(saveData, null, '\t'));
                                console.log(`{${res.id}:${res.value}}`);
                                port.write(`{${res.id}:${res.value}}`, function () { });
                            }
                        }
                        if (head) {
                            savedDataList.push(res);
                            saveData[type].list = savedDataList;
                            writeFile("output.json", JSON.stringify(saveData, null, '\t'));
                        }
                    } catch (e) {

                    }
                });
            }
        });

        socket.on("load", function (data) {
            console.log("load")
            if (data === null) {
                readFile("output.json", function (data) {
                    try {
                        socket.emit('list', JSON.parse(data), function (res) { });
                    } catch (e) {
                        console.log(e);
                    }
                });
            }
        });
    });
}

http.listen(PORT, () => {
    console.log(`listening on *:${PORT}`);
});

//ファイル読み込み関数
function readFile(path, success) {
    fs.readFile(path, 'utf8', function (err, data) {
        if (err) {
            throw err;
        }
        success(data);
    });
}

function writeFile(path, data) {
    fs.writeFile(path, data, function (err) {
        if (err) {
            throw err;
        }
    });
}
var sendEnable = true;

function log(data) {
    console.log(data);
}