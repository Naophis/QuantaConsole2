var fs = require('fs');
var serialPort = require("serialport");
var settings = require('./settings');
var Slalom = require('./slalom').SlalomSimulator;
var io = require('socket.io').listen(8080);
var sp;
var globalScoket;
var msg = "";

io.set('heartbeat timeout', 5000);
io.set('heartbeat interval', 5000);

io.sockets.on('connection', function (socket) {
	globalScoket = socket;
	let interval;
	sp = new serialPort.SerialPort("COM3", {
		baudrate: 230400,
		parser: serialPort.parsers.readline("\n")
	});
	socket.on('disconnect', function () {
		sp.close(function () {
			log("closed");
		});
	});
	sp.on('data', function (data) {
		console.log(data);
		if (globalScoket) {
			globalScoket.emit('message', {
				message: data
			}, function (res) {});
		}
		// console.log(data);
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
		sp.write(`{${key}:${val}}`, function () {
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

					// console.log(savedDataList);
					// if(true){
					// 	return;
					// }
					var head = true;
					for (var i = 0; i < savedDataList.length; i++) {
						if (savedDataList[i].id === res.id) {
							savedDataList[i] = res;
							saveData[type].list = savedDataList;
							head = false;
							writeFile("output.json", JSON.stringify(saveData, null, '\t'));
							console.log(`{${res.id}:${res.value}}`);
							sp.write(`{${res.id}:${res.value}}`, function () {});
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
		if (data === null) {
			readFile("output.json", function (data) {
				try {
					socket.emit('list', JSON.parse(data), function (res) {});
				} catch (e) {
					console.log(e);
				}
			});
		}
	});
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

log('server listening ...');

function log(data) {
	console.log(data);
}