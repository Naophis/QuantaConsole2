var app = angular.module('myApp', []);
app.controller('HelloWorldController', ['$scope', function ($scope) {
    $scope.paramList = [];
    $scope.flashName = "";
    $scope.cmdMode = 0;
    $scope.changeTestMode = function () {
        console.log($scope.cmdMode)
    }
    $scope.makeArray = function () {
        $scope.arr.length = 0;
        for (var i = 0; i < parseInt($scope.cols); i++) {
            $scope.arr.push(i);
        }
    }
    socket.on("list", function (res) {
        var data = convertHandson(res);
        console.log(res);
        $scope.recieveData = res;
        $scope.$apply();
    });
    $scope.load = function (id) {
        socket.emit("load", "test.json");
    }
    $scope.connect = function (id) {
        let target = $.isNumeric(id) ? id : null;
        socket.emit("load", id);
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
    $scope.update = function (param) {
        var obj = reverseForJson(param);
        console.log(obj)
        socket.emit("update3", {
            param: obj,
            target: "test.json"
        });
    }
    $scope.load();
    $("input").focus(function () {
        console.log("focus")
    });

    $scope.copy = function () {
        let colLength = table.getDataAtCol(0).length;
        let str = `#ifndef CONFIG_PARAMUARTIMPORTER_H_
#define CONFIG_PARAMUARTIMPORTER_H_
`;
        for (var i = 0; i < colLength; i++) {
            let row = table.getDataAtRow(i);
            const rowLength = row.length;
            var index = parseInt(row[13]);
            str += createStr(row, index);
        }
        str += `
#endif`;
        clipcopy(str);
    }

    function clipcopy(str) {
        $("#hoge").html(str);
        $("#hoge").select();
        document.execCommand('copy');
    }

    $scope.allSensordata = "";
}]);

let columns = [{
        data: "velocity"
    },
    {
        data: "type"
    },
    {
        data: "ang"
    },
    {
        data: "radius"
    },
    {
        data: "front1"
    },
    {
        data: "back1"
    },
    {
        data: "front2"
    },
    {
        data: "back2"
    },
    {
        data: "time"
    },
    {
        data: "n"
    },
    {
        data: "frontleft1"
    },
    {
        data: "frontleft2"
    },
    {
        data: "firstFront"
    },
    {
        data: "index"
    }, {
        data: "update",
        renderer: "html",
        readOnly: true
    }
];

const colHeaders = [
    'velocity', 'type', 'ang', 'radius', "front1",
    "back1", "front2", "back2", "time",
    "n", "frontleft1", "frontleft2", "firstFront", "index", "update"
];

let getMergeCellList = function () {
    let list = [];

    // for (let i = 0; i < 30; i += 5) {
    //     list.push({
    //         row: i,
    //         col: 0,
    //         rowspan: 5,
    //         colspan: 1
    //     })
    // }
    return list;
}


function createStr(rows, index) {
    let str = "";
    str = `void set${rows[1]}Param${rows[0]}(){`;
    str += `myprintf("----turn=${rows[1]}   v=${rows[0]}-----------\\r\\n");`
    str += `float ang,radius,front1,back1,front2,back2,time,n,v,frontleft1,frontleft2,firstfront;`;

    str += `ang=*(float *)${index};myprintf("ang\t%f\t%d\\r\\n",ang,${index});\r\n`;
    index += 4;

    str += `radius=*(float *)${index};myprintf("radius\t%f\t%d\\r\\n",radius,${index});\r\n`;
    index += 4;

    str += `front1=*(float *)${index};myprintf("front1\t%f\t%d\\r\\n",front1,${index});\r\n`;
    index += 4;

    str += `back1=*(float *)${index};myprintf("back1\t%f\t%d\\r\\n",back1,${index});\r\n`;
    index += 4;

    str += `front2=*(float *)${index};myprintf("front2\t%f\t%d\\r\\n",front2,${index});\r\n`;
    index += 4;

    str += `back2=*(float *)${index};myprintf("back2\t%f\t%d\\r\\n",back2,${index});\r\n`;
    index += 4;

    str += `time=*(float *)${index};myprintf("time\t%f\t%d\\r\\n",time,${index});\r\n`;
    index += 4;

    str += `n=*(float *)${index};myprintf("n\t%f\t%d\\r\\n",n,${index});\r\n`;
    index += 4;

    str += `v=*(float *)${index};myprintf("v\t%f\t%d\\r\\n",v,${index});\r\n`;
    index += 4;

    str += `frontleft1=*(float *)${index};myprintf("frontleft1\t%f\t%d\\r\\n",frontleft1,${index});\r\n`;
    index += 4;

    str += `frontleft2=*(float *)${index};myprintf("frontleft2\t%f\t%d\\r\\n",frontleft2,${index});\r\n`;
    index += 4;

    str += `firstfront=*(float *)${index};myprintf("firstfront\t%f\t%d\\r\\n",firstfront,${index});\r\n`;

    str += `setPrms(${rows[1]},  ang, radius,  front1,
		 back1,  front2,  back2,  time,  n, v) ;
	setPrms3(${rows[1]}, frontleft1, frontleft2, firstfront);`

    str += `myprintf("----------------------------------\\r\\n");}
    `;

    return str;
}