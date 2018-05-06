var time = 0;
var socket = io.connect('http://localhost:3000');

document.addEventListener('DOMContentLoaded', function () {
    socket.on('connect', function (data) {
        socket.headbeatTimeout = 5000;
        connected = true;
        $("#connection").html("接続中")
            .addClass("connect")
            .removeClass("disconnect");
    });
    socket.on('disconnect', function (data) {
        $("#connection").html("切断中")
            .addClass("disconnect")
            .removeClass("connect");
        slalom = null;
    });
    socket.on('error', function (reason) {　
        console.error(reason, 'Error!');
    });

    socket.on('message', function (data, fn) {
        console.log(JSON.stringify(data))
    });

    function connect() {
        log("connect");
        socket.emit("connect", {
            message: true
        });
    }

    function disconnect() {
        log("disconnect");
        socket.emit("connect", {
            message: false
        }, function (result) {
            $("#connection").html(result);
        });
    }

    function log(data) {
        console.log(data);
    }
});

function toggleConnection() {
    var result = $("#connection").hasClass("connect");
    if (result) {
        socket.disconnect();
        $("#connection").addClass("disconnect");
        $("#connection").removeClass("connect");
    } else {
        socket.connect();
    }
}

document.addEventListener('keyup', (event) => {
    const keyName = event.key;
    if (keyName === 'Escape') {
        socket.disconnect();
    } else if (keyName === 'F4') {
        socket.connect();
    }
}, false);