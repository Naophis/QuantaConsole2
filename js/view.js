mapView = function (size, view) {
    var self = this;
    self.createButtonMap(size);
    setTimeout(function () {
        self.applyModel(size, view.map);
    }, 0);
    self.view = view;
}
mapView.prototype.applyModel = function (size, map) {
    var _self = this;
    for (var i = 0; i < size; i++) {
        for (var j = 0; j < size; j++) {
            _self.set(j, i, 1, ((map[j][i] & 0x01) == 0x01));
            _self.set(j, i, 2, ((map[j][i] & 0x02) == 0x02));
            _self.set(j, i, 4, ((map[j][i] & 0x04) == 0x04));
            _self.set(j, i, 8, ((map[j][i] & 0x08) == 0x08));
        }
    }
}
mapView.prototype.createButtonMap = function (size) {
    $("#map_data").empty();
    if (!size) {
        size = 16;
    }
    var tmp = "";
    for (var j = -1; j < size + 1; j++) {
        var line;
        if (j >= 0 && j <= size - 1) {
            line = `<td class="btn_header">${j}</td>`;
        } else {
            line = `<td></td>`;
        }
        tmp += line;
    }
    $("#map_data").append(`<tr class="map_row">${tmp}</tr>`);

    var rows = "";
    for (var i = size - 1; i >= 0; i--) {
        var tmpBox = "";
        for (var j = 0; j < size; j++) {
            tmpBox += `<td><button class="btn2" id=m_${j}_${i} x=${j} y=${i}></button></td>`;
        }
        var head = `<td class="btn_left">${i}</td>`;
        var tail = `<td class="btn_right">${i}</td>`;
        rows += `<tr class="map_row">${head}${tmpBox}${tail}</tr>`;
    }
    $("#map_data").append(rows);

    var line2 = "";
    for (var j = -1; j < size + 1; j++) {
        if (j >= 0 && j <= size - 1) {
            line2 += `<td class="btn_footer">${j}</td>`;
        } else {
            line2 += `<td></td>`;
        }
    }
    $("#map_data").append(`<tr class="map_row">${line2}</tr>`);
    this.btnAction();
}
mapView.prototype.updateWall = function (x, y, dir, bool) {
    var target = $("[x=" + x + "][y=" + y + "]");
}
mapView.prototype.btnAction = function () {
    var _self = this;
    $(".btn2").on("click", function (e) {
        var x = Number($(this).attr("x"));
        var y = Number($(this).attr("y"));
        var w = $(this).innerWidth() / 2;
        var h = $(this).innerHeight() / 2;
        var deltaW = e.offsetX - w;
        var deltaH = h - e.offsetY;
        if ((Math.abs(deltaW) - Math.abs(deltaH)) > 0) {
            if (deltaW > 0) {
                _self.update(x, y, (x + 1), y, 2, 4);
            } else {
                _self.update(x, y, (x - 1), y, 4, 2);
            }
        } else {
            if (deltaH > 0) {
                _self.update(x, y, x, (y + 1), 1, 8);
            } else {
                _self.update(x, y, x, (y - 1), 8, 1);
            }
        }
    });
};
mapView.prototype.update = function (x1, y1, x2, y2, d1, d2) {
    var _self = this;
    if (x2 < 0 || x2 >= _self.view.MAZE_SIZE || y2 < 0 || y2 >= _self.view.MAZE_SIZE) {
        return;
    }
    var isWall = _self
        .view
        .isWall(x1, y1, d1);
    _self
        .view
        .updateWallData(x1, y1, d1, !isWall);
    _self
        .view
        .updateWallData(x2, y2, d2, !isWall);
    _self.apply(x1, y1, d1, isWall);
    _self.apply(x2, y2, d2, isWall);
}
mapView.prototype.apply = function (x, y, dir, isWall) {
    // return; if (!isWall) {     if (dir == 1) {
    // $(`[x=${x}][y=${y}]`).addClass("hasNorth");     } else if (dir == 2) {
    // $(`[x=${x}][y=${y}]`).addClass("hasEast");     } else if (dir == 4) {
    // $(`[x=${x}][y=${y}]`).addClass("hasWest");     } else if (dir == 8) {
    // $(`[x=${x}][y=${y}]`).addClass("hasSouth");     } } else {     if (dir == 1)
    // {         $(`[x=${x}][y=${y}]`).removeClass("hasNorth");     } else if (dir
    // == 2) {         $(`[x=${x}][y=${y}]`).removeClass("hasEast");     } else if
    // (dir == 4) {         $(`[x=${x}][y=${y}]`).removeClass("hasWest");     } else
    // if (dir == 8) {         $(`[x=${x}][y=${y}]`).removeClass("hasSouth");     }
    // } return;

    var el = document.getElementById(`m_${x}_${y}`);
    if (!isWall) {
        if (dir == 1) {
            el
                .classList
                .add("hasNorth");
        } else if (dir == 2) {
            el
                .classList
                .add("hasEast");
        } else if (dir == 4) {
            el
                .classList
                .add("hasWest");
        } else if (dir == 8) {
            el
                .classList
                .add("hasSouth");
        }
    } else {
        if (dir == 1) {
            el
                .classList
                .remove("hasNorth");
        } else if (dir == 2) {
            el
                .classList
                .remove("hasEast");
        } else if (dir == 4) {
            el
                .classList
                .remove("hasWest");
        } else if (dir == 8) {
            el
                .classList
                .remove("hasSouth");
        }
    }
}
mapView.prototype.set = function (x, y, dir, isWall) {
    if (isWall) {
        if (dir == 1) {
            $("[x=" + x + "][y=" + y + "]").addClass("hasNorth");
        } else if (dir == 2) {
            $("[x=" + x + "][y=" + y + "]").addClass("hasEast");
        } else if (dir == 4) {
            $("[x=" + x + "][y=" + y + "]").addClass("hasWest");
        } else if (dir == 8) {
            $("[x=" + x + "][y=" + y + "]").addClass("hasSouth");
        }
    } else {
        if (dir == 1) {
            $("[x=" + x + "][y=" + y + "]").removeClass("hasNorth");
        } else if (dir == 2) {
            $("[x=" + x + "][y=" + y + "]").removeClass("hasEast");
        } else if (dir == 4) {
            $("[x=" + x + "][y=" + y + "]").removeClass("hasWest");
        } else if (dir == 8) {
            $("[x=" + x + "][y=" + y + "]").removeClass("hasSouth");
        }
    }
}