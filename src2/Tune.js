var fs = require('fs');

class Tune {
    static update(res, port) {
        var type = res.type;
        var target = `params/${res.target}`;
        delete res.type;
        delete res.target;
        readFile(target, function (json) {
            try {
                var saveData = JSON.parse(json);
                var savedDataList = saveData[type].list;
                var head = true;
                for (var i = 0; i < savedDataList.length; i++) {
                    if (savedDataList[i].id === res.id) {
                        savedDataList[i] = res;
                        saveData[type].list = savedDataList;
                        head = false;
                        writeFile(target, JSON.stringify(saveData, null, '\t'));
                        console.log(`{${res.id}:${res.value}}`);
                        port.write(`{${res.id}:${res.value}}`, function () {});
                    }
                }
                if (head) {
                    savedDataList.push(res);
                    saveData[type].list = savedDataList;
                    writeFile(target, JSON.stringify(saveData, null, '\t'));
                }
            } catch (e) {

            }
        });
    }
    static update2(res, port) {
        var param = res.param;
        var type = param.type;
        var turnType = param.turnType;
        var target = `params/${res.target}`;
        delete param.type;
        delete param.turnType;
        readFile(target, function (json) {
            try {
                var saveData = JSON.parse(json);
                for (var k in saveData) {
                    if (k === type) {
                        for (var j in saveData[k]) {
                            if (j === turnType) {
                                (saveData[k])[j] = param[j];
                                writeFile(target, JSON.stringify(saveData, null, '\t'));
                                const index = param[j].index;
                                Tune.write(param[j], port);
                            }
                        }
                    }
                }
            } catch (e) {

            }
        });
    }
    static load(target, socket) {
        target = `params/${target}`;
        readFile(target, function (data) {
            try {
                socket.emit('list', JSON.parse(data), function (res) {});
            } catch (e) {
                console.log(e);
            }
        });
    }

    static all_write(target, port) {
        target = `params/${target}`;

        async function sleep2(delay, result) {
            return new Promise(resolve => {
                setTimeout(() => resolve(result), delay);
            });
        }

        async function exec2(data) {
            let json = JSON.parse(data);
            const keys1 = Object.keys(json);
            console.log(keys1);
            let counter = 0;
            const waitTime = 40;
            for (let j = 0; j < keys1.length; j++) {
                const key1 = keys1[j];
                const list = json[key1].list;
                for (let i = 0; i < list.length; i++) {
                    await sleep2(waitTime, i + 1);
                    let index = list[i].id;
                    let param = list[i].value;
                    console.log(index, param);
                    port.write(`{${index}:${param}}`, function () {});
                    counter++;
                }
            }
            console.log(`write amount ${counter}`);
        }
        readFile(target, function (data) {
            exec2(data);
        });
    }


    static all_write2(target, port) {
        target = `params/${target}`;

        async function sleep2(delay, result) {
            return new Promise(resolve => {
                setTimeout(() => resolve(result), delay);
            });
        }

        async function exec2(data) {
            let json = JSON.parse(data);
            const keys1 = Object.keys(json);
            let counter = 0;
            for (let j = 0; j < keys1.length; j++) {
                const key1 = keys1[j];
                const paramlist = json[key1];
                delete paramlist.velocity;
                const keys2 = Object.keys(paramlist);
                for (let k = 0; k < keys2.length; k++) {
                    const key2 = keys2[k];
                    const paramlist2 = paramlist[key2];
                    let idx = parseInt(paramlist2.index);
                    delete paramlist2.index;

                    const keys3 = Object.keys(paramlist2);
                    for (let m = 0; m < keys3.length; m++) {
                        await sleep2(10);
                        const key3 = keys3[m];
                        const param = paramlist2[key3];
                        console.log(idx, param);
                        port.write(`{${idx}:${param}}`, function () {});
                        idx += 4;
                        counter++;
                    }
                }

            }
            console.log(`write amount ${counter}`);
        }
        readFile(target, function (data) {
            exec2(data);
        });
    }

    static write(param, port) {
        // delayミリ秒待機する。任意の第二引数を結果として返す。
        async function sleep(delay, result) {
            return new Promise(resolve => {
                setTimeout(() => resolve(result), delay);
            });
        }
        async function exec() {
            let index = parseInt(param.index);
            delete param.index;
            const keys = Object.keys(param);
            for (let i = 0; i < keys.length; i++) {
                await sleep(40);
                console.log(index, param[keys[i]]);
                port.write(`{${index}:${param[keys[i]]}}`, function () {});
                index += 4;
            }
        }
        exec();
    }
}

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

module.exports = Tune;