var mapModel = (function () {
    var MAZE_SIZE;
    var mapModel = function (size, data) {
        if (data) {
            this.MAZE_SIZE = size;
            this.map = data;
            this.view = new mapView(size, this);
        } else {
            this.MAZE_SIZE = size;
            this.map = new Array();
            for (var i = 0; i < size; i++) {
                this.map[i] = new Array();
                for (var j = 0; j < size; j++) {
                    this.map[i][j] = 0;
                }
            }
            for (var i = 0; i < size; i++) {
                for (var j = 0; j < size; j++) {
                    var wall = 0;
                    if (i == 0) {
                        wall |= 8;
                    } else if (i == size - 1) {
                        wall |= 1;
                    }
                    if (j == 0) {
                        wall |= 4;
                    } else if (j == size - 1) {
                        wall |= 2;
                    }
                    this.map[j][i] = wall;
                }
            }
            this.view = new mapView(size, this);
        }
    }
    var p = mapModel.prototype;
    p.getWallData = function (x, y, dir) {
        return this.map[x][y];
    };
    p.isWall = function (x, y, dir) {
        return (this.map[x][y] & (0x01 * dir)) != 0x00;
    };
    p.updateWallData = function (x, y, dir, isWall) {
        if (x < 0 || x >= this.MAZE_SIZE || y < 0 || y >= this.MAZE_SIZE) {
            return true;
        }
        if (isWall) {
            this.map[x][y] |= 0x01 * dir;
            return true;
        } else {
            this.map[x][y] = (this.map[x][y] & 0xf0) | (this.map[x][y] & (~(0x01 * dir) & 0x0f));
            return false;
        }
    };
    p.step = function (x, y, dir, isWall) {}
    return mapModel;
})();