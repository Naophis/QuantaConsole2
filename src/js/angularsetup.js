var app = angular.module('myApp', []);
app.controller('HelloWorldController', ['$scope', function ($scope) {
    $scope.paramList = [];
    $scope.flashName = "";
    socket.on("list", function (res) {
        $scope.recieveData = res;
        $scope.ffparamList = res.ff.list;
        $scope.fbparamList = res.fb.list;
        $scope.sensorparamList = res.sensor.list;
        $scope.walloffparamlist = res.walloff.list;
        // $scope.ffparamList = res.ff.list;
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
    });
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

    $scope.allSensordata = "";
}]);