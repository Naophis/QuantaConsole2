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
                await sleep(50);
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