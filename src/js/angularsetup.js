var app = angular.module('myApp', []);
app.controller('HelloWorldController', ['$scope', function ($scope) {
    $scope.paramList = [];
    $scope.flashName = "";
    $scope.story = "現在のストーリー";
    $scope.cmdCode = 0;
    socket.on("list", function (res) {
        $scope.recieveData = res;
        $scope.ffparamList = res.ff.list;
        $scope.fbparamList = res.fb.list;
        $scope.sensorparamList = res.sensor.list;
        $scope.walloffparamlist = res.walloff.list;
        let tmpLength = res.ff.list.length;
        $scope.ffparamList.push({
            isNew: true,
            id: res.ff.index + 4 * res.ff.list.length
        });
        $scope.fbparamList.push({
            isNew: true,
            id: res.fb.index + 4 * res.fb.list.length
        });
        $scope.sensorparamList.push({
            isNew: true,
            id: res.sensor.index + 4 * res.sensor.list.length
        });
        $scope.walloffparamlist.push({
            isNew: true,
            id: res.walloff.index + 4 * res.walloff.list.length
        });
        $scope.$apply();
        $scope.cmd = {};
        showStory();
        $scope.$apply();
    });

    function showStory() {
        var cmd = parseInt($scope.ffparamList[11].value);
        var slalom_v = parseInt($scope.ffparamList[12].value);
        var acc = parseInt($scope.ffparamList[13].value);
        var max_velocity = parseInt($scope.ffparamList[14].value);
        var isDia = parseInt($scope.ffparamList[15].value);
        var sla_scenario = parseInt($scope.ffparamList[16].value);
        var sla_scenario2 = parseInt($scope.ffparamList[17].value);
        var sla_return_flg = parseInt($scope.ffparamList[18].value);
        var sla_return_scenario2 = parseInt($scope.ffparamList[19].value);

        var dist = parseInt($scope.ffparamList[20].value);
        var distDia = parseInt($scope.ffparamList[21].value);
        var turnAngle = parseInt($scope.ffparamList[22].value);
        var turnTimes = parseInt($scope.ffparamList[23].value);
        var turn_acc = parseInt($scope.ffparamList[24].value);
        var turn_w = parseInt($scope.ffparamList[25].value);

        $scope.cmdCode = cmd;
        $scope.cmd = {
            v: slalom_v,
            acc: acc,
            maxV: max_velocity,
            isDia: isDia == 1,
            scenario: detectSlalomPattern(sla_scenario),
            startTurn: sla_scenario2 == 1,
            returnFlg: sla_return_flg == 1,
            returnTurn: detectSlalomPattern(sla_return_scenario2),
            dist: dist,
            distDia: distDia,
            turnAngle: turnAngle,
            turnTimes: turnTimes,
            turn_acc: turn_acc,
            turn_w: turn_w,
            searchVelocity: parseInt($scope.ffparamList[26].value),
            searchAccel: parseInt($scope.ffparamList[27].value),
            searchDeAcc: parseInt($scope.ffparamList[28].value),
            knownVelocity: parseInt($scope.ffparamList[29].value),
            gx: parseInt($scope.ffparamList[30].value),
            gy: parseInt($scope.ffparamList[31].value)
        }
    }

    function detectSlalomPattern(sla) {
        if (sla === 0) {
            return "Normal";
        }
        if (sla === 1) {
            return "Large";
        }
        if (sla === 2) {
            return "Orval";
        }
        if (sla === 3) {
            return "Dia45";
        }
        if (sla === 4) {
            return "Dia135";
        }
        if (sla === 5) {
            return "Dia90";
        }
    }
    $scope.load = function (id) {
        socket.emit("load", "output.json");
    }
    $scope.connect = function (id) {
        socket.emit("load", "output.json");
    }
    $scope.disconnect = function (id) {
        let target = $.isNumeric(id) ? id : null;
        socket.emit("disconnect", id);
    }

    $scope.connect = function () {
        socket.emit("myconnect");
    }

    $scope.disconnect = function () {
        socket.emit("mydisconnect");
    }
    $scope.update = function (type, param) {
        var map;
        if (type === "ff") {
            map = $scope.ffparamList.filter(function (prm) {
                return prm.id === param.id;
            });
        }
        if (type === "fb") {
            map = $scope.fbparamList.filter(function (prm) {
                return prm.id === param.id;
            });
        }
        if (type === "sensor") {
            map = $scope.sensorparamList.filter(function (prm) {
                return prm.id === param.id;
            });
        }
        if (type === "walloff") {
            map = $scope.walloffparamlist.filter(function (prm) {
                return prm.id === param.id;
            });
        }

        if (param.isNew) {
            if ($.isNumeric(param.value) && !$.isNumeric(param.name &&
                    typeof param.name === "string" &&
                    param.name.length > 0)) {
                socket.emit("update", {
                    type: type,
                    id: ~~param.id,
                    name: param.name,
                    value: param.value,
                    descript: param.descript,
                    target: "output.json"
                });
                param.isNew = false;
                if (type === "ff") {
                    $scope.ffparamList.push({
                        isNew: true,
                        id: $scope.recieveData.ff.index + 4 * $scope.recieveData.ff.list.length
                    });
                }
                if (type === "fb") {
                    $scope.fbparamList.push({
                        isNew: true,
                        id: $scope.recieveData.fb.index + 4 * $scope.recieveData.fb.list.length
                    });
                }
                if (type === "sensor") {
                    $scope.sensorparamList.push({
                        isNew: true,
                        id: $scope.recieveData.sensor.index + 4 * $scope.recieveData.sensor.list.length
                    });
                }
                if (type === "walloff") {
                    $scope.walloffparamlist.push({
                        isNew: true,
                        id: $scope.recieveData.walloff.index + 4 * $scope.recieveData.walloff.list.length
                    });
                }
            }
        } else {
            if ($.isNumeric(map[0].value) && !$.isNumeric(map[0].name &&
                    typeof map[0].name === "string" &&
                    map[0].name.length > 0)) {
                socket.emit("update", {
                    type: type,
                    id: ~~map[0].id,
                    name: map[0].name,
                    value: map[0].value,
                    descript: map[0].descript,
                    target: "output.json"
                });
            }
        }
        showStory()
    }
    $scope.load();
    $("input").focus(function () {
        console.log("focus")
    });


    function setAllFFDataScript() {
        var str = "";
        for (var i of $scope.ffparamList) {
            if (i.name !== undefined && i.id !== undefined) {
                str += `${i.name}=*(float *)${i.id};myprintf("${i.name}\t%f\t%d\\r\\n",${i.name},${i.id});\r\n`
            }
        }
        $scope.allffdata = str;
    }

    $scope.getAllFFDataScript = function () {
        var str = "";
        for (var i of $scope.ffparamList) {
            if (i.name !== undefined && i.id !== undefined) {
                str += `${i.name}=*(float *)${i.id};myprintf("${i.name}\t%f\t%d\\r\\n",${i.name},${i.id});\r\n`
            }
        }
        copy(str);
    }
    $scope.allffdata = "";

    function setAllFBDataScript() {
        var str = "";
        for (var i of $scope.fbparamList) {
            if (i.name !== undefined && i.id !== undefined) {
                str += `${i.name}=*(float *)${i.id};myprintf("${i.name}\t%f\t%d\\r\\n",${i.name},${i.id});\r\n`
            }
        }
        $scope.allfbdata = str;
    }

    $scope.getAllFBDataScript = function () {
        var str = "";
        for (var i of $scope.fbparamList) {
            if (i.name !== undefined && i.id !== undefined) {
                str += `${i.name}=*(float *)${i.id};myprintf("${i.name}\t%f\t%d\\r\\n",${i.name},${i.id});\r\n`
            }
        }
        copy(str);
    }

    $scope.allfbdata = "";

    function setAllSensorDataScript() {
        var str = "";
        for (var i of $scope.sensorparamList) {
            if (i.name !== undefined && i.id !== undefined) {
                str += `${i.name}=*(float *)${i.id};myprintf("${i.name}\t%f\t%d\\r\\n",${i.name},${i.id});\r\n`
            }
        }
        $scope.allSensordata = str;
    }

    $scope.getSensorScript = function () {
        var str = "";
        for (var i of $scope.sensorparamList) {
            if (i.name !== undefined && i.id !== undefined) {
                str += `${i.name}=*(float *)${i.id};myprintf("${i.name}\t%f\t%d\\r\\n",${i.name},${i.id});\r\n`
            }
        }
        copy(str);
    }

    $scope.getWallOffScript = function () {
        var str = "";
        for (var i of $scope.walloffparamlist) {
            if (i.name !== undefined && i.id !== undefined) {
                str += `${i.name}=*(float *)${i.id};myprintf("${i.name}\t%f\t%d\\r\\n",${i.name},${i.id});\r\n`
            }
        }
        copy(str);
    }



    function copy(str) {
        $("#hoge").html(str);
        $("#hoge").select();
        document.execCommand('copy');
    }

    $scope.all_write = function (id) {
        socket.emit("all_write", "output.json");
    }

    $scope.allSensordata = "";
}]);