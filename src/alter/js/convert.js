var convertHandson = function (obj) {
    const keys = Object.keys(obj);
    list = [];

    for (let i in obj) {
        const tmp = obj[i];
        for (let j in tmp) {
            if (j === "velocity" || j === "index" || j === "name") {
                continue;
            }
            const tmp2 = tmp[j];
            list.push({
                velocity: tmp.velocity,
                type: j,
                ang: tmp2.ang,
                radius: tmp2.radius,
                front1: tmp2.front1,
                back1: tmp2.back1,
                front2: tmp2.front2,
                back2: tmp2.back2,
                time: tmp2.time,
                n: tmp2.n,
                frontleft1: tmp2.frontleft1,
                frontleft2: tmp2.frontleft2,
                firstFront: tmp2.firstFront,
                index: tmp2.index,
                update: `<button class="updatebtn" index="${list.length}">update</button>`
            });
        }
    }
    for (var i = 0; list.length < 30; i++) {
        list.push({
            update: `<button class="updatebtn" index="${list.length}">update</button>`
        });
    }
    return list;
}

var reverseForJson = function (list) {
    var obj = {
        velocity: list[0],
        type: `v${list[0]}`,
        turnType: list[1]
    };
    obj[list[1]] = {
        ang: list[2],
        radius: list[3],
        front1: list[4],
        back1: list[5],
        front2: list[6],
        back2: list[7],
        time: list[8],
        n: list[9],
        v: list[0],
        frontleft1: list[10],
        frontleft2: list[11],
        firstFront: list[12],
        index: list[13]
    }
    return obj;
}