var fs = require("fs");
var br = /\r\n|\r|\n/;

//キュー(Array.shift/pushは遅いため)
var Queue = (function () {
    var buffer = [];
    var len = 0;

    //ノード
    var Node = function () {
        this.next = null;
        this.prev = null;
        this.item = null;
    };

    //リンクリストを作成
    var Queue = function () {
        this.head = new Node();
        this.tail = new Node();

        this.head.next = this.tail;
        this.tail.prev = this.head;

        this.length = 0;
    };

    //キューに追加
    Queue.prototype.enqueue = function (item) {
        this.length++;

        var node = len ? buffer[--len] : new Node();
        node.item = item;

        var first = this.head.next;
        first.prev = node;
        node.next = first;

        this.head.next = node;
        node.prev = this.head;
    };

    //キューから取り出し
    Queue.prototype.dequeue = function () {
        if (this.length == 0) {
            return null;
        }

        this.length--;
        var last = this.tail.prev;
        this.tail.prev = last.prev;
        last.prev.next = this.tail;

        var result = last.item;
        last.next = null;
        last.prev = null;
        last.item = null;
        buffer[len++] = last;

        return result;
    };

    return Queue;
})();

var LineReader = function (filename, bufferSize) {
    // ファイル読み込み
    this.fd = fs.openSync(filename, "r");

    // バッファサイズ
    bufferSize = parseInt(bufferSize);
    if (isNaN(bufferSize) || bufferSize <= 0) {
        bufferSize = 4096;
    }

    // バッファ作成
    this.buf = new Buffer(bufferSize + 7);
    this.sub = new Buffer(bufferSize + 7);

    this.size = bufferSize; //バッファサイズ
    this.subPos = 0; // サブバッファの有効ポジション
    this.bom = true; // BOMの処理要求フラグ
    this.lineBuffer = new Queue(); // ラインバッファ
    this.textBuffer = ""; //テキストバッファ
    this.closed = false; //EOF
    this.count = 0; //行数
    this.line = null; // 読み込みライン
    this.lastMatch = null; //最後の改行マッチ
};

//次の行を読み込み
LineReader.prototype.next = function () {
    //ラインバッファが補充されるまで読み込み
    if (!this.closed) {
        while (this.lineBuffer.length == 0) {
            //読み込み
            if (!this.read()) {
                //EOFになったら終了
                break;
            }
        }
    }

    //行があれば取得
    if (this.lineBuffer.length > 0) {
        this.line = this.lineBuffer.dequeue();
        this.count++;
        return true;
    }

    //行がなければ終了
    this.line = null;
    return false;
};

//行を追加
LineReader.prototype.append = function (line, eof) {
    var match;

    //テキストをバッファリング
    this.textBuffer += line;

    //行に分割
    while (match = br.exec(this.textBuffer)) {
        if (!(this.lastMatch == "\r" && this.textBuffer[0] == "\n")) {
            this.lineBuffer.enqueue(this.textBuffer.substr(0, match.index));
        }
        this.lastMatch = match[0];
        this.textBuffer = this.textBuffer.substr(match.index + match[0].length);
    }

    //最後の行
    if (eof) {
        this.lineBuffer.enqueue(this.textBuffer);
    }
};

//ファイルから読み込み
LineReader.prototype.read = function () {
    // バッファに読み込む
    var readed = fs.readSync(this.fd, this.buf, 0, this.size);

    // BOMが未処理なら処理する
    var foundBOM = false;
    if (this.bom) {
        this.bom = false;
        if (this.buf[0] == 0xef && this.buf[1] == 0xbb && this.buf[2] == 0xbf) {
            foundBOM = true;
        }
    }

    // サブバッファに転送する
    if (foundBOM) {
        // BOMをスキップ
        this.buf.copy(this.sub, this.subPos, 3, readed);
        readed -= 3;
    } else {
        this.buf.copy(this.sub, this.subPos, 0, readed);
    }

    // サブバッファの読み込み可能サイズを取得
    var subLen = this.subPos + readed;

    // サブバッファの後ろから文字の区切りを検索
    var pos = 0;
    for (var i = subLen - 1; i >= 0; i--) {
        // バイトの先頭2bitを検証
        var byte = this.sub[i];
        var head = byte & 0xc0;
        if (head == 0x80) {
            continue;
        }

        if (head == 0xc0) {
            // マルチバイトの場合(0b11xxxxxx)は区切りを検索
            // 先頭から1が連続しているビット数を求める(2〜6)
            var m = ~byte & 0xfc;
            m |= m >> 1;
            m |= m >> 2;
            m |= m >> 4;
            m = (m & 0x55) + ((m >> 1) & 0x55);
            m = (m & 0x33) + ((m >> 2) & 0x33);
            m = 8 - ((m & 0xf) + ((m >> 4) & 0xf));

            if (i + m > subLen) {
                // 文字の途中でバッファが途切れる場合
                this.append(this.sub.toString("utf8", 0, i));
                pos = i;
            } else {
                // 文字のバイトが全てバッファに収まっている場合
                this.append(this.sub.toString("utf8", 0, i + m));
                pos = i + m;
            }

            break;
        }

        // asciiの場合(0b10xxxxxx)はその文字を含めて文字列化
        this.append(this.sub.toString("utf8", 0, i + 1));
        pos = i + 1;
        break;
    }

    // サブバッファの余りを先頭に移動する
    this.sub.copy(this.buf, 0, pos, subLen);
    this.buf.copy(this.sub, 0, 0, subLen - pos)
    this.subPos = subLen - pos;

    // 読み込めなくなったら終了
    if (readed == 0) {
        this.close();
        this.append(this.sub.toString("utf8", 0, this.subPos), true);
        return false;
    }

    return true;
};

//ファイルを閉じる
LineReader.prototype.close = function () {
    if (!this.closed) {
        this.closed = true;
        fs.closeSync(this.fd);
    }
};

//exports
module.exports = LineReader;