var LineReader = require("./LineReader");
var fs = require('fs');

var targetDir = "src3/results";

var targetFile = "src3/results/diagonal_resultR.txt";
var deleteFolderRecursive = function (path) {
    if (fs.existsSync(path)) {
        fs.readdirSync(path).forEach(function (file) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                deleteFolderRecursive(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
        });
        fs.rmdirSync(path);
    }
};
try {
    deleteFolderRecursive(targetDir);
} catch (e) {
    console.log(e);
}
try {
    fs.mkdirSync(targetDir);
} catch (e) {
    console.log(e);
}

//ファイルのパスを渡してインスタンスを作成
var reader = new LineReader("src3/res/log.txt");

//reader.next()がfalseを返すまでループ

var leftflag = false;
var list2 = [];
var i = 0;
while (reader.next()) {
    var line = reader.line;
    line = line.replace(/\s{2,}/, " ");

    var list = line.split(" ");
    var L45 = parseFloat(list[7]);
    var R45 = parseFloat(list[8]);
    var L90 = parseFloat(list[20]);
    var R90 = parseFloat(list[21]);
    var distL = parseFloat(list[34]);
    var distR = parseFloat(list[35]);
    var imgR45 = parseFloat(list[22]);
    var imgR90 = parseFloat(list[23]);
    var imgL45 = parseFloat(list[29]);
    var imgL90 = parseFloat(list[30]);
    list2.push({
        L45: L45,
        R45: R45,
        L90: L90,
        R90: R90,
        distL: distL,
        distR: distR,
        imgR45: imgR45,
        imgR90: imgR90,
        imgL45: imgL45,
        imgL90: imgL90
    });
    let l = `${distL}\t${Math.round(distL)}\t${L90}\t${Math.round(L90)}\t${L45}\t${Math.round(L45)}\r\n`;
    let r = `${distR}\t${Math.round(distR)}\t${R90}\t${Math.round(R90)}\t${R45}\t${Math.round(R45)}\r\n`;
    fs.appendFileSync(`${targetDir}/L.txt`, l);
    fs.appendFileSync(`${targetDir}/R.txt`, r);
}
reader.close();

var l45 = `float sen_l_dia_img[255] = {`;
var reader2 = new LineReader("src3/res/logL45.txt");
while (reader2.next()) {
    var line = reader2.line;
    var num = parseFloat(line);
    if (num + 0 === num) {
        l45 += `${line},`;
    }
}
l45 = l45.slice(0, -1);
l45 += `};\r\n`;
fs.appendFileSync(`${targetDir}/result.txt`, l45);
reader2.close();

var r45 = `float sen_r_dia_img[255] = {`;
var reader2 = new LineReader("src3/res/logR45.txt");
while (reader2.next()) {
    var line = reader2.line;
    var num = parseFloat(line);
    if (num + 0 === num) {
        r45 += `${line},`;
    }
}
r45 = r45.slice(0, -1);
r45 += `};\r\n`;
fs.appendFileSync(`${targetDir}/result.txt`, r45);
reader2.close();

var r90 = `float sen_r90_dia[255] = {`;
var reader2 = new LineReader("src3/res/logR90.txt");
while (reader2.next()) {
    var line = reader2.line;
    var num = parseFloat(line);
    if (num + 0 === num) {
        r90 += `${line},`;
    }
}
r90 = r90.slice(0, -1);
r90 += `};\r\n`;
fs.appendFileSync(`${targetDir}/result.txt`, r90);
reader2.close();

var l90 = `float sen_l90_dia[255] = {`;
var reader2 = new LineReader("src3/res/logL90.txt");
while (reader2.next()) {
    var line = reader2.line;
    var num = parseFloat(line);
    if (num + 0 === num) {
        l90 += `${line},`;
    }
}
l90 = l90.slice(0, -1);
l90 += `};\r\n`;
fs.appendFileSync(`${targetDir}/result.txt`, l90);
reader2.close();



// var listSize = list2.length;
// var flagL = false;
// var flagR = false;

// var fileIndexL = 0;
// var fileIndexR = 0;

// var listR = [];
// var listL = [];
// var c = 0;
// var c2 = 0;
// var flag = 0;
// for (var i = 20; i < listSize; i++) {
//     var now = list2[i];
//     var next = list2[i + 1];

//     if (next && Math.round(next.distL) > 0 && Math.round(now.distL) === 0) {
//         flagL = true;
//     }
//     if (next && Math.round(next.distR) > 0 && Math.round(now.distR) === 0) {
//         flagR = true;
//     }
//     if (flagL && next && now.L45 > 0) {
//         c++;
//         if (c > 800 && Math.floor(now.distL) === 0) {
//             // break;
//             flag++;
//         } else {
//             listL.push({
//                 dist: Math.round(now.distL),
//                 _90: (now.L90),
//                 _45: (now.L45),
//                 img_45: (now.imgL45),
//                 img_90: (now.imgL90)
//             });
//             fs.appendFileSync(`${targetDir}/L${fileIndexL}.txt`, `${now.distL}\t${Math.round(now.distL)}\t${now.L90}\t${now.L45}\t${now.imgL90}\t${now.imgL45}\r\n`);
//         }
//     }
//     if (flagR && next && now.R45 > 0) {
//         c2++;
//         if (c2 > 1200 && Math.floor(now.distR) === 0) {
//             // break;
//             flag++;
//         } else {
//             listR.push({
//                 dist: Math.round(now.distR),
//                 _90: (now.R90),
//                 _45: (now.R45),
//                 img_45: (now.imgR45),
//                 img_90: (now.imgR90)
//             });
//             fs.appendFileSync(`${targetDir}/R${fileIndexR}.txt`, `${now.distR}\t${Math.round(now.distR)}\t${now.R90}\t${now.R45}\t${now.imgR90}\t${now.imgR45}\r\n`);
//         }
//     }
//     if (flag === 2) {
//         break;
//     }
// }
// return;
// fs.appendFileSync(`${targetDir}/result.txt`, `#ifndef CONFIG_DIAGONALIMPORTER_H_\r\n`);
// fs.appendFileSync(`${targetDir}/result.txt`, `#define CONFIG_DIAGONALIMPORTER_H_\r\n`);
// fs.appendFileSync(`${targetDir}/result.txt`, `void diaImport() {\r\n`);

// var listR2 = new Array(256);
// var listL2 = new Array(256);
// for (var i = 0; i < listR.length; i++) {
//     var tmp = listR[i];
//     var dist = Math.round(tmp.dist);
//     var _45 = tmp._45;
//     var _90 = tmp._90;
//     var img_45 = tmp.img_45;
//     var img_90 = tmp.img_90;
//     listR2[dist] = {
//         _45: _45,
//         _90: _90,
//         img_45: img_45,
//         img_90: img_90
//     }
//     if (dist == 255) {
//         break;
//     }
// }
// for (var i = 0; i < listL.length; i++) {
//     var tmp = listL[i];
//     var dist = Math.round(tmp.dist);
//     var _45 = tmp._45;
//     var _90 = tmp._90;
//     var img_45 = tmp.img_45;
//     var img_90 = tmp.img_90;
//     listL2[dist] = {
//         _45: _45,
//         _90: _90,
//         img_45: img_45,
//         img_90: img_90
//     }
//     if (dist == 255) {
//         break;
//     }
// }
// for (var i = 0; i < listR2.length; i++) {
//     var tmp = listR2[i];
//     if (!tmp) {
//         break;
//     }
//     var dist = i;
//     var _45 = tmp._45;
//     var _90 = tmp._90;
//     var img_45 = tmp.img_45;
//     var img_90 = tmp.img_90;
//     fs.appendFileSync(`${targetDir}/result.txt`, `sen_r_dia_img[${dist}]=${_45};`);
//     fs.appendFileSync(`${targetDir}/result.txt`, `sen_r90_dia[${dist}]=${_90};\r\n`);

//     fs.appendFileSync(`${targetDir}/R.txt`, `${dist}\t${_45}\t${_90}\t${img_45}\t${img_90}\r\n`);
// }

// for (var i = 0; i < listL2.length; i++) {
//     var tmp = listL2[i];
//     if (!tmp) {
//         break;
//     }
//     var dist = i;
//     var _45 = tmp._45;
//     var _90 = tmp._90;
//     var img_45 = tmp.img_45;
//     var img_90 = tmp.img_90;
//     fs.appendFileSync(`${targetDir}/result.txt`, `sen_l_dia_img[${dist}]=${_45};`);
//     fs.appendFileSync(`${targetDir}/result.txt`, `sen_l90_dia[${dist}]=${_90};\r\n`);

//     fs.appendFileSync(`${targetDir}/L.txt`, `${dist}\t${_45}\t${_90}\t${img_45}\t${img_90}\r\n`);
// }
// fs.appendFileSync(`${targetDir}/result.txt`, `}\r\n`);

// fs.appendFileSync(`${targetDir}/result.txt`, `#endif \r\n`);


// console.log(list2[0])