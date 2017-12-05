var Math = require("mathjs");
var SlalomSimulator = (function () {
    var SlalomSimulator = function (d) {
        Math.config({
            number: 'bignumber',
            precision: 64
        });
        var self = this;
        var tmpAng = Math.bignumber(d.angle);
        var a180 = Math.bignumber(180);

        self.velocity = Math.bignumber(d.velocity);
        self.angle = Math.multiply(Math.pi, tmpAng);
        self.angle = Math.divide(self.angle, a180);
        self.radius = Math.bignumber(d.radius);
        self.n = Math.bignumber(d.n);
        if (self.n == 2) {
            self.Et = Math.bignumber(0.603450161218938087668);
        } else if (self.n == 4) {
            self.Et = Math.bignumber(0.763214618198974433973);
        } else if (self.n == 6) {
            self.Et = Math.bignumber(0.831273734768234095272);
        }
    };
    var p = SlalomSimulator.prototype;
    p.exe = function () {
        var self = this;
        let term = self.calcTime();
        let list = self.makeLiner(term);
        return {
            list: list,
            time: term
        };
    };

    p.makeLiner = function (term) {
        var self = this;
        term = Math.multiply(term, Math.bignumber(2));
        let t = Math.bignumber(0);
        var dt = Math.bignumber(1);
        var tmp1 = Math.bignumber(2);
        tmp1 = Math.pow(tmp1, 12);
        dt = Math.divide(dt, tmp1);
        var alphaTmp = Math.divide(self.velocity, self.radius);
        var alpha = Math.bignumber(0);
        var W_now = Math.bignumber(0);
        var ang = Math.bignumber(0);
        var angOld = ang;
        var tmpVelocity = Math.multiply(self.velocity, dt);
        var x1 = Math.bignumber(90);
        var x2 = Math.bignumber(90);
        var y1 = Math.bignumber(90);
        var y2 = Math.bignumber(90);
        var list = [
            [90, 90]
        ];
        var c = 0;
        while (Math.compare(t, term) < 0) {
            t = Math.add(t, dt);
            alpha = Math.multiply(alphaTmp, self.EtCalc(t, term));
            W_now = Math.add(W_now, Math.multiply(alpha, dt));
            // if (V_now * W_now / 9.8 > max) {
            //     max = V_now * W_now / 9.8;
            // }
            if (Math.compare(ang, self.angle) >= 0) {
                console.log("ang>target");
                break;
            }
            if (Math.compare(Math.abs(alpha), Math.bignumber(1000000)) >= 0) {
                console.log("out of range");
                break;
            }
            if (alpha.toString() == "0") {
                c++;
            } else {
                c = 0;
            }
            if (c == 10) {
                break;
            }
            angOld = ang;
            ang = Math.add(ang, Math.multiply(W_now, dt));
            x2 = Math.add(x1, Math.multiply(tmpVelocity, Math.sin(ang)));
            y2 = Math.add(y1, Math.multiply(tmpVelocity, Math.cos(ang)));
            list.push([Number(x2.toString()), Number(y2.toString())]);
            x1 = x2;
            y1 = y2;
        }
        return list;
    }
    p.EtCalc = function (t, term) {
        var self = this;
        var e2 = Math.bignumber(0);
        var t1 = t;
        t = Math.divide(t, Math.multiply(term, Math.bignumber(512)));
        if (Math.compare(t, Math.bignumber(1024)) > 0) {
            console.log("out!");
            return Math.bignumber(0);
        }
        t = Math.divide(t1, term);
        var P1 = Math.pow(Math.subtract(t, Math.bignumber(1)), Math.subtract(self.n, Math.bignumber(1)));
        var P2 = Math.multiply(P1, Math.subtract(t, Math.bignumber(1)));
        e2 = Math.multiply(Math.bignumber(-1), self.n);
        e2 = Math.multiply(e2, P1);
        var e3 = Math.pow(Math.exp(Math.bignumber(1)), Math.add(Math.bignumber(1), Math.divide(Math.bignumber(1), Math.subtract(P2, Math.bignumber(1)))));
        e2 = Math.multiply(e2, e3);
        e2 = Math.divide(e2, Math.multiply(Math.subtract(P2, Math.bignumber(1)), Math.subtract(P2, Math.bignumber(1))));
        e2 = Math.divide(e2, term);
        // console.log(P1.toString(), P2.toString(), e2.toString(), e3.toString());
        return e2;
    }

    p.calcTime = function () {
        var self = this;
        var dt = Math.bignumber(1);
        var tmp1 = Math.bignumber(2);
        tmp1 = Math.pow(tmp1, 20);
        dt = Math.divide(dt, tmp1);
        let R1 = Math.bignumber(0);
        let t1 = Math.bignumber(0);
        let c = 0;
        let tmp = Math.multiply(2.0, self.velocity);
        tmp = Math.multiply(tmp, self.Et);
        tmp = Math.divide(tmp, self.radius);
        while (c < 10000000) {
            t1 = Math.add(t1, dt);
            R1 = Math.multiply(tmp, t1);
            if (Math.compare(R1, self.angle) >= 0) {
                return t1;
            }
            c++;
        }
        return t1;
    }
    return SlalomSimulator;
})();
exports.SlalomSimulator = SlalomSimulator;