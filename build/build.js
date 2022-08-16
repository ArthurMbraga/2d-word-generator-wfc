var ColorHelper = (function () {
    function ColorHelper() {
    }
    ColorHelper.getColorVector = function (c) {
        return createVector(red(c), green(c), blue(c));
    };
    ColorHelper.rainbowColorBase = function () {
        return [
            color('red'),
            color('orange'),
            color('yellow'),
            color('green'),
            color(38, 58, 150),
            color('indigo'),
            color('violet')
        ];
    };
    ColorHelper.getColorsArray = function (total, baseColorArray) {
        var _this = this;
        if (baseColorArray === void 0) { baseColorArray = null; }
        if (baseColorArray == null) {
            baseColorArray = ColorHelper.rainbowColorBase();
        }
        var rainbowColors = baseColorArray.map(function (x) { return _this.getColorVector(x); });
        ;
        var colours = new Array();
        for (var i = 0; i < total; i++) {
            var colorPosition = i / total;
            var scaledColorPosition = colorPosition * (rainbowColors.length - 1);
            var colorIndex = Math.floor(scaledColorPosition);
            var colorPercentage = scaledColorPosition - colorIndex;
            var nameColor = this.getColorByPercentage(rainbowColors[colorIndex], rainbowColors[colorIndex + 1], colorPercentage);
            colours.push(color(nameColor.x, nameColor.y, nameColor.z));
        }
        return colours;
    };
    ColorHelper.getColorByPercentage = function (firstColor, secondColor, percentage) {
        var firstColorCopy = firstColor.copy();
        var secondColorCopy = secondColor.copy();
        var deltaColor = secondColorCopy.sub(firstColorCopy);
        var scaledDeltaColor = deltaColor.mult(percentage);
        return firstColorCopy.add(scaledDeltaColor);
    };
    return ColorHelper;
}());
var PolygonHelper = (function () {
    function PolygonHelper() {
    }
    PolygonHelper.draw = function (numberOfSides, width) {
        push();
        var angle = TWO_PI / numberOfSides;
        var radius = width / 2;
        beginShape();
        for (var a = 0; a < TWO_PI; a += angle) {
            var sx = cos(a) * radius;
            var sy = sin(a) * radius;
            vertex(sx, sy);
        }
        endShape(CLOSE);
        pop();
    };
    return PolygonHelper;
}());
var DIMENTION = 200;
var TILES = [
    {
        height: 0,
        id: 0,
        color: "#3f48cc",
        top: [0, 1],
        right: [0, 1],
        bottom: [0, 1],
        left: [0, 1],
    },
    {
        height: 1,
        id: 1,
        color: "#00a2e8",
        top: [1, 2, 0],
        right: [1, 2, 0],
        bottom: [1, 2, 0],
        left: [1, 2, 0],
    },
    {
        height: 2,
        id: 2,
        color: "#99d9ea",
        top: [1, 2, 3],
        right: [1, 2, 3],
        bottom: [1, 2, 3],
        left: [1, 2, 3],
    },
    {
        height: 3,
        id: 3,
        color: "#efe4b0",
        top: [3, 4, 5],
        right: [3, 4, 5],
        bottom: [3, 4, 5],
        left: [3, 4, 5],
    },
    {
        height: 4,
        id: 4,
        color: "#b5e61d",
        top: [5, 3, 4, 2],
        right: [5, 3, 4, 2],
        bottom: [5, 3, 4, 2],
        left: [5, 3, 4, 2],
    },
    {
        height: 5,
        id: 5,
        color: "#22b14c",
        top: [5, 4, 10],
        right: [5, 4, 10],
        bottom: [5, 4, 10],
        left: [5, 4, 10],
    },
    {
        height: 6,
        id: 10,
        color: "#7bc60d",
        top: [10, 6, 5],
        right: [10, 6, 5],
        bottom: [10, 6, 5],
        left: [10, 6, 5],
    },
    {
        height: 7,
        id: 6,
        color: "#b97a57",
        top: [7, 6, 10, 12],
        right: [7, 6, 10, 12],
        bottom: [7, 6, 10, 12],
        left: [7, 6, 10, 12],
    },
    {
        height: 8,
        id: 7,
        color: "#7f7f7f",
        top: [7, 8, 6],
        right: [7, 8, 6],
        bottom: [7, 8, 6],
        left: [7, 8, 6],
    },
    {
        height: 9,
        id: 8,
        color: "#c3c3c3",
        top: [7, 8, 9],
        right: [7, 8, 9],
        bottom: [7, 8, 9],
        left: [7, 8, 9],
    },
    {
        height: 10,
        id: 9,
        color: "#fff",
        top: [8],
        right: [8],
        bottom: [8],
        left: [8],
    },
    {
        height: -1,
        id: 11,
        color: "#0af",
        top: [11],
        right: [13, 14],
        bottom: [11],
        left: [13, 14],
    },
    {
        height: -1,
        id: 14,
        color: "#abf",
        top: [13, 11],
        right: [14],
        bottom: [13, 11],
        left: [14],
    },
    {
        height: -1,
        id: 12,
        color: "#0f0",
        top: [12],
        right: [12],
        bottom: [12],
        left: [12],
    },
    {
        height: -1,
        id: 13,
        color: "#fea",
        top: [13, 14, 11],
        right: [11, 14, 11, 13],
        bottom: [13, 14, 11],
        left: [11, 14, 11, 13],
    },
];
var _a = mountLookupData(), LOOK_UP = _a.lookup, TILES_IDS = _a.ids;
var cellsToUpdate = new Set();
var grid = [];
var pixelSize;
function mountLookupData() {
    var lookup = {};
    var ids = [];
    for (var _i = 0, TILES_1 = TILES; _i < TILES_1.length; _i++) {
        var tile = TILES_1[_i];
        ids.push(tile.id);
        lookup[tile.id] = tile;
    }
    return { lookup: lookup, ids: ids };
}
function setup() {
    background(0);
    createCanvas(windowWidth, windowHeight);
    pixelSize = round(min(width, height) / DIMENTION);
    for (var x = 0; x < DIMENTION; x++) {
        grid[x] = [];
        for (var y = 0; y < DIMENTION; y++) {
            grid[x][y] = {
                coords: { x: x, y: y },
                options: TILES_IDS,
                collapsedId: undefined,
            };
        }
    }
    var collapsingCell = getRandomCellFromGrid();
    collapsingCell.options = [13];
    collapseAndPropagateChanges(collapsingCell);
}
function collapseAndPropagateChanges(cell) {
    collapseCell(cell);
    drawCell(cell.coords.x, cell.coords.y, getCellColor(cell));
    var neighbors = getNeighbors(cell);
    var changedCellsToUpdate = false;
    neighbors.forEach(function (neighbor) {
        reduceOptions(cell, neighbor);
        if (neighbor.options.length === 0) {
            var minxId_1 = max(TILES_IDS);
            var maxId_1 = 0;
            getNeighbors(neighbor).forEach(function (neighborNeighbor) {
                if (neighborNeighbor.collapsedId > maxId_1)
                    maxId_1 = neighborNeighbor.collapsedId;
                if (neighborNeighbor.collapsedId < minxId_1)
                    minxId_1 = neighborNeighbor.collapsedId;
            });
            neighbor.collapsedId = undefined;
            neighbor.options = [];
            var _loop_1 = function (i) {
                neighbor.options.push(TILES.find(function (_a) {
                    var height = _a.height;
                    return height === i;
                }).id);
            };
            for (var i = minxId_1; i <= maxId_1; i++) {
                _loop_1(i);
            }
            cellsToUpdate.add(neighbor);
            changedCellsToUpdate = true;
        }
        else if (isCollapsed(neighbor))
            verifyCollapse(neighbor);
        else {
            if (neighbor.options.length === 1)
                cellsToUpdate.add(neighbor);
            else {
                changedCellsToUpdate = true;
                cellsToUpdate.add(neighbor);
            }
        }
    });
    if (changedCellsToUpdate)
        orderSet();
}
function windowResized() {
    background(0);
    resizeCanvas(windowWidth, windowHeight);
    pixelSize = round(min(width, height) / DIMENTION);
    for (var x = 0; x < DIMENTION; x++) {
        for (var y = 0; y < DIMENTION; y++) {
            var cell = grid[x][y];
            drawCell(x, y, getCellColor(cell));
        }
    }
}
function draw() {
    var size = 32;
    fill("#fff");
    textSize(size);
    text("Updating cell - ".concat(cellsToUpdate.size), 30, DIMENTION * pixelSize + size);
    try {
        for (var i = 0; i < 100; i++) {
            if (cellsToUpdate.size > 0)
                collapseAndPropagateChanges(cellsToUpdate.values().next().value);
            else
                break;
        }
    }
    catch (error) { }
}
function getCellColor(cell) {
    if (cell.options.length === 0)
        return "#f00";
    if (!isCollapsed(cell))
        return "#ddd";
    return LOOK_UP[cell.collapsedId].color;
}
function drawCell(x, y, color) {
    fill(color);
    noStroke();
    rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}
function getRandomCellFromGrid() {
    var x = floor(random(DIMENTION));
    var y = floor(random(DIMENTION));
    return grid[x][y];
}
function getRandomElementFromArray(array) {
    return array[floor(random(array.length))];
}
function collapseCell(cell) {
    if (cell.collapsedId)
        console.warn("algo errado aconteceu!");
    cellsToUpdate.delete(cell);
    cell.collapsedId = getRandomElementFromArray(cell.options);
}
var getNeighbors = function (cell) {
    var _a = cell.coords, x = _a.x, y = _a.y;
    var neighbors = [];
    if (x > 0)
        neighbors.push(grid[x - 1][y]);
    if (x < DIMENTION - 1)
        neighbors.push(grid[x + 1][y]);
    if (y > 0)
        neighbors.push(grid[x][y - 1]);
    if (y < DIMENTION - 1)
        neighbors.push(grid[x][y + 1]);
    return neighbors;
};
function reduceOptions(originCell, targetCell) {
    var originTitle = LOOK_UP[originCell.collapsedId];
    var position = getRelativeCellPosition(originCell, targetCell);
    if (position) {
        var availableOptions_1 = originTitle[position];
        targetCell.options = targetCell.options.filter(function (id) {
            return availableOptions_1.includes(id);
        });
        if (targetCell.options.length === 0) {
            console.warn("Beu bosta!");
        }
    }
}
function getRelativeCellPosition(originCell, targetCell) {
    var _a = originCell.coords, originX = _a.x, originY = _a.y;
    var _b = targetCell.coords, neighborX = _b.x, neighborY = _b.y;
    if (originX === neighborX) {
        if (originY === neighborY + 1)
            return "top";
        if (originY === neighborY - 1)
            return "bottom";
    }
    else if (originY === neighborY) {
        if (originX === neighborX - 1)
            return "right";
        if (originX === neighborX + 1)
            return "left";
    }
    return undefined;
}
function orderSet() {
    var orderedSet = Array.from(cellsToUpdate).sort(function (a, b) { return a.options.length - b.options.length; });
    cellsToUpdate = new Set(orderedSet);
}
var currentTile = TILES[0];
function keyPressed() {
    if (keyCode === UP_ARROW)
        changeCursorTile();
}
function changeCursorTile() {
    var index = TILES.findIndex(function (tile) { return tile.id === currentTile.id; });
    if (index === TILES.length - 1)
        currentTile = TILES[0];
    currentTile = TILES[index + 1];
    console.log("🚀 ~ file: sketch.ts ~ line 273 ~ changeCursorTile ~ currentTile", currentTile);
}
function mouseClicked() {
    var _a = getCellCordsFromClick(mouseX, mouseY), x = _a.x, y = _a.y;
    var cell = grid[x][y];
    console.log("🚀 ~ file: sketch.ts ~ line 276 ~ mouseClicked ~ cell", cell);
    cell.options = [currentTile.id];
    collapseAndPropagateChanges(cell);
}
function getCellCordsFromClick(x, y) {
    return {
        x: floor(x / pixelSize),
        y: floor(y / pixelSize),
    };
}
function verifyCollapse(cell) {
    var isCollapseValid = cell.options.some(function (id) { return id === cell.collapsedId; });
    if (!isCollapseValid)
        collapseCell(cell);
}
function isCollapsed(cell) {
    return cell.collapsedId !== undefined;
}
//# sourceMappingURL=build.js.map