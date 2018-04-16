var Slalom = (function () {
    var type = "Normal";
    var angle = 90;
    var Slalom = function (socket) {
        var self = this;
        self.socket = socket;
        socket.on("slalom", function (data) {
            makeChartTurn("slalom_g", data.list, type);
        });
        $(".turn_kinds").on("click", function (e) {
            type = e.target.value;
            if (type == "Normal") {
                $("#radius").val(50);
                angle = 90;
            } else if (type == "Large") {
                $("#radius").val(110);
                angle = 90;
            } else if (type == "Orval") {
                $("#radius").val(88);
                angle = 180;
            } else if (type == "Dia45") {
                $("#radius").val(110);
                angle = 45;
            } else if (type == "Dia135") {
                $("#radius").val(85);
                angle = 135;
            } else if (type == "Dia90") {
                $("#radius").val(80);
                angle = 90;
            }
        });
        $("#turn_btn").off("click");
        $("#turn_btn").on("click", function () {
            self.socket.emit("slalom", {
                type: type,
                velocity: Number($("#velocity").val()),
                radius: Number($("#radius").val()),
                angle: angle,
                n: Number($("#napier").val())
            });
        });
    };
    var p = Slalom.prototype;
    p.send = function (msg) {
        this.socket.emit("slalom", {
            value: msg
        });
    };
    return Slalom;
})();