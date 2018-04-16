var time = 0;
var socket = io.connect('http://localhost:8080');
// var socket = io.connect('http://naoto.local:8080');

// var socket = io.connect('http://nodemouse.local:8080');

var displayMode = "sensor";

let logs = {
    battery: [],
    gyro: [],
    velociry: [],
    angle: [],
    LS2: [],
    LS1: [],
    RS2: [],
    RS1: [],
    LF1: [],
    RF1: []
};
let sensor_list = [];
let gyro_list = [];
let battery_list = [];
let interval;
let slalom;

$(document).ready(function () {
    socket.on('connect', function (data) {
        socket.headbeatTimeout = 5000;
        connected = true;
        $("#connection").html("接続中")
            .addClass("connect")
            .removeClass("disconnect");
        slalom = new Slalom(socket);
    });
    socket.on('disconnect', function (data) {
        clearInterval(interval);
        $("#connection").html("切断中")
            .addClass("disconnect")
            .removeClass("connect");
        slalom = null;
    });
    socket.on('error', function (reason) {　
        console.error(reason, 'Error!');
    });

    socket.on('message', function (data, fn) {
        // console.log(data);
        console.log(JSON.stringify(data))
        try {
            var reg = new RegExp("{.*}", "g");
            if (displayMode == "map") {} else if (!data.message.match(reg)) {
                return;
            }
            var d = JSON.parse(data.message);
            if (displayMode == "sensor") {
                applySensorData(d);
                $("#console").html(data.message);
            } else if (displayMode == "map") {
                readMap(d);
            } else if (displayMode == "walls_g") {
                logs.RS1 = addSensor(logs.RS1, d.RS1);
                logs.RS2 = addSensor(logs.RS2, d.RS2);
                logs.LS1 = addSensor(logs.LS1, d.LS1);
                logs.LS2 = addSensor(logs.LS2, d.LS2);
                logs.RF1 = addSensor(logs.RF1, d.RF1);
                logs.LF1 = addSensor(logs.LF1, d.LF1);
                // logs.gyro = addSensor(logs.gyro, d.gyro, 100);
                sensor_list = [];
                logs.gyro = addSensor(logs.gyro, d.gyro);
                logs.battery = addSensor(logs.battery, d.battery);
                gyro_list = [{
                    name: 'Gyro',
                    data: logs.gyro
                }];
                battery_list = [{
                    name: 'Battery',
                    data: logs.battery
                }]
                if ($("#RS1_g").prop("checked")) {
                    sensor_list.push({
                        name: 'RS1',
                        data: logs.RS1
                    });
                }
                if ($("#RS2_g").prop("checked")) {
                    sensor_list.push({
                        name: 'RS2',
                        data: logs.RS2
                    });
                }
                if ($("#LS1_g").prop("checked")) {
                    sensor_list.push({
                        name: 'LS1',
                        data: logs.LS1
                    });
                }
                if ($("#LS2_g").prop("checked")) {
                    sensor_list.push({
                        name: 'LS2',
                        data: logs.LS2
                    });
                }
                if ($("#RF1_g").prop("checked")) {
                    sensor_list.push({
                        name: 'RF1',
                        data: logs.RF1
                    });
                }
                if ($("#LF1_g").prop("checked")) {
                    sensor_list.push({
                        name: 'LF1',
                        data: logs.LF1
                    });
                }
            } else if (displayMode == "sen_g") {
                logs.battery = addBattery(logs.battery, d.battery);
                let list = [{
                    name: 'sen_g',
                    data: logs.battery
                }];
                makeChart("sen_g2", list);
            } else if (displayMode == "battery_g") {
                logs.battery = addBattery(logs.battery, d.battery);
                let list = [{
                    name: 'Battery',
                    data: logs.battery
                }];
                makeChart("battery_g2", list);
            } else if (displayMode == "gyro_g") {
                logs.gyro = addBattery(logs.gyro, d.gyro);
                let list = [{
                    name: 'Gyro',
                    data: logs.gyro
                }];
                makeChart("gyro_g2", list);
            }
        } catch (e) {
            // console.log(e);
        }
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
    applySensorData(Sensor);

    changeDisplay("sensor");
    // changeDisplay("Slalom");
    // makeChart();
    // createButtonMap();


    $("#send").on("click", function () {
        let v = $("#data").val();
        socket.emit("sci", {
            target: "" + 0,
            value: v
        });
    });

});

function addBattery(list, v) {
    if (list.length == 50) {
        list.shift();
    }
    list.push(v);
    return list;
}

function addSensor(list, v, limit) {
    if (!limit) {
        limit = 50;
    }
    if (list.length == limit) {
        list.shift();
    }
    list.push(v);
    return list;
}

function makeChart(target, lists, w) {
    var width = $(window).width();
    if (w) {
        width /= 2;
    }
    var height = $(window).width();
    $("#" + target).highcharts({
        chart: {
            width: width * 0.9,
            height: 400
        },
        series: lists,
        plotOptions: {
            line: {
                animation: false
            }
        },
    });
}
$(function () {
    (function (H) {
        H.wrap(H.Chart.prototype, 'setChartSize', function (proceed, skipAxes) {
            var chart = this,
                inverted = chart.inverted,
                renderer = chart.renderer,
                chartWidth = chart.chartWidth,
                chartHeight = chart.chartHeight,
                optionsChart = chart.options.chart,
                spacing = chart.spacing,
                clipOffset = chart.clipOffset,
                clipX,
                clipY,
                plotLeft,
                plotTop,
                plotWidth,
                plotHeight,
                plotBorderWidth,
                plotAreaWidth = chart.options.chart.plotAreaWidth,
                plotAreaHeight = chart.options.chart.plotAreaHeight;

            if (plotAreaWidth) {
                chart.plotWidth = plotWidth = plotAreaWidth;
                chart.plotLeft = plotLeft = Math.round((chartWidth - plotAreaWidth) / 2);
            } else {
                chart.plotLeft = plotLeft = Math.round(chart.plotLeft);
                chart.plotWidth = plotWidth = Math.max(0, Math.round(chartWidth - plotLeft - chart.marginRight));
            }
            if (plotAreaHeight) {
                chart.plotTop = plotTop = Math.round((chartHeight - plotAreaHeight) / 2);
                chart.plotHeight = plotHeight = plotAreaHeight;
            } else {
                chart.plotTop = plotTop = Math.round(chart.plotTop);
                chart.plotHeight = plotHeight = Math.max(0, Math.round(chartHeight - plotTop - chart.marginBottom));
            }

            chart.plotSizeX = inverted ? plotHeight : plotWidth;
            chart.plotSizeY = inverted ? plotWidth : plotHeight;

            chart.plotBorderWidth = optionsChart.plotBorderWidth || 0;

            // Set boxes used for alignment
            chart.spacingBox = renderer.spacingBox = {
                x: spacing[3],
                y: spacing[0],
                width: chartWidth - spacing[3] - spacing[1],
                height: chartHeight - spacing[0] - spacing[2]
            };
            chart.plotBox = renderer.plotBox = {
                x: plotLeft,
                y: plotTop,
                width: plotWidth,
                height: plotHeight
            };

            plotBorderWidth = 2 * Math.floor(chart.plotBorderWidth / 2);
            clipX = Math.ceil(Math.max(plotBorderWidth, clipOffset[3]) / 2);
            clipY = Math.ceil(Math.max(plotBorderWidth, clipOffset[0]) / 2);
            chart.clipBox = {
                x: clipX,
                y: clipY,
                width: Math.floor(chart.plotSizeX - Math.max(plotBorderWidth, clipOffset[1]) / 2 - clipX),
                height: Math.max(0, Math.floor(chart.plotSizeY - Math.max(plotBorderWidth, clipOffset[2]) / 2 - clipY))
            };

            if (!skipAxes) {
                Highcharts.each(chart.axes, function (axis) {
                    axis.setAxisSize();
                    axis.setAxisTranslation();
                });
            }
        });
    }(Highcharts));
});

var getSeries = function (lists, type) {
    return [{
        name: type,
        type: 'scatter',
        data: lists,
        marker: {
            radius: 1
        }
    }, {
        data: [
            [90, 45],
            [90, 480]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [180, 45],
            [180, 480]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [45, 45],
            [360, 360]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [45, 90],
            [360, 90]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [45, 180],
            [360, 180]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [45, 225],
            [225, 45]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [270, 45],
            [270, 360]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [45, 270],
            [360, 270]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [45, 315],
            [315, 45]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }, {
        data: [
            [45, 405],
            [405, 45]
        ],
        color: '#FF0000',
        lineWidth: 1,
        marker: {
            enabled: false
        }
    }];
}

function calcGyroGain() {

}

function makeChartTurn(target, lists, type) {
    var width = $(window).width();
    var height = $(window).width();
    var graphWidth = 350;
    var p = {
        x: 45,
        y: 45
    };
    $('#' + target).highcharts({
        chart: {
            plotAreaWidth: 600,
            plotAreaHeight: 600
        },
        rangeSelector: {
            selected: 1,
        },
        plotBackgroundColor: "#000000",
        series: getSeries(lists, type),
        xAxis: [{
            min: p.x,
            max: 360,
            tickInterval: 45,
            labels: {
                enabled: false
            },
            // minTickInterval: 45,
        }],
        yAxis: [{
            min: p.y,
            max: 360,
            tickInterval: 45,
            labels: {
                enabled: false
            },
            // minTickInterval: 5,
        }],
    });
}

function updateChart(target, list) {
    var width = $(window).width();
    var height = $(window).width();
    $("#" + target).highcharts({
        chart: {
            width: width * 0.9,
            height: height * 0.4
        },
        series: lists,
        plotOptions: {
            line: {
                animation: false
            }
        },
    });
}
var Sensor = {
    LS2: 0,
    LS1: 0,
    RS2: 0,
    RS1: 0,
    LF1: 0,
    RF1: 0,
    gyro: 0,
    battery: 0
};

function applySensorData(d) {
    $("#ls2").html(Math.round(d.LS2));
    $("#ls1").html(Math.round(d.LS1));
    $("#rs2").html(Math.round(d.RS2));
    $("#rs1").html(Math.round(d.RS1));
    $("#lf1").html(Math.round(d.LF1));
    $("#rf1").html(Math.round(d.RF1));

    $("#ls2_2").html(Math.round(d.LS2_2));
    $("#ls1_2").html(Math.round(d.LS1_2));
    $("#rs2_2").html(Math.round(d.RS2_2));
    $("#rs1_2").html(Math.round(d.RS1_2));
    $("#lf1_2").html(Math.round(d.LF1_2));
    $("#rf1_2").html(Math.round(d.RF1_2));

    $("#gyro").html(d.gyro);
    $("#battery").html(d.battery + "V");
}

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

function calcGain() {
    var gain = Number($("#gain_r").val().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }));
    var ang = Number($("#angle_r").val().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }));
    var time = Number($("#time").val().replace(/[Ａ-Ｚａ-ｚ０-９]/g, function (s) {
        return String.fromCharCode(s.charCodeAt(0) - 0xFEE0);
    }));
    var target = Math.PI;
    console.log(target / (target - ang / time));
    var diff = target / (target - ang / time) * gain;
    console.log(gain, ang, time, target, diff);
    var result = diff;
    $("#result_r").val(result);
}

document.addEventListener('keyup', (event) => {
    const keyName = event.key;
    if (keyName === 'Escape') {
        socket.disconnect();
    } else if (keyName === 'F4') {
        socket.connect();
        // } else if (keyName === "s") {
        //     changeDisplay("sensor");
        // } else if (keyName === "m") {
        //     changeDisplay("map");
        // } else if (keyName === "g") {
        //     changeDisplay("walls_g");
        // } else if (keyName === "t") {
        // changeDisplay("Slalom");
        // } else {
        //     if (!slalom) {
        //         slalom = new Slalom(socket);
        //     }
        //     slalom.send(keyName);
        //     console.log(keyName);
    }
}, false);

function changeDisplay(mode) {
    displayMode = mode;
    if (displayMode == "Slalom") {
        makeChartTurn("slalom_g", [], true);
    } else if (displayMode == "walls_g") {
        interval = setInterval(function () {
            makeChart("walls_g2", sensor_list, true);
            makeChart("battery_g2", battery_list, true);
            makeChart("gyro_g2", gyro_list);
        }, 500);
    } else {
        clearInterval(interval);
    }
    $(".jumbotron.special").each(function () {
        $(this).css("display", "none");
    });
    $("#" + displayMode).css("display", "block");
}
$(window).on("resize", function () {
    $(".jumbotron.special").each(function () {
        var w = $(window).width();
        $(this).width(w);
        $(this).css({
            "margin-right": "auto",
            "margin-left": "auto"
        })
    });
});

$(window).trigger("resize");

function createMap() {
    var t = $("#map_data").get(0);
};

function update(x, y, now, dir, next) {
    if (dir == 1) {}
}