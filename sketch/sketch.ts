//Types
type Cell = {
  options: number[];
  collapsedId: number | undefined;
  coords: Coords;
};

type Tile = {
  height: number;
  id: number;
  color: string;
  top: number[];
  right: number[];
  bottom: number[];
  left: number[];
};
type Coords = { x: number; y: number };

// Constants
const DIMENTION = 200;
const TILES: Tile[] = [
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
  //Vertical
  {
    height: -1,
    id: 11,
    color: "#0af",
    top: [11],
    right: [13, 14],
    bottom: [11],
    left: [13, 14],
  },
  //Horizontal
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
const { lookup: LOOK_UP, ids: TILES_IDS } = mountLookupData();

// Variables
let cellsToUpdate = new Set<Cell>();
const grid: Cell[][] = [];
let pixelSize: number;

function mountLookupData() {
  const lookup: { [key: number]: Tile } = {};
  const ids: number[] = [];

  for (const tile of TILES) {
    ids.push(tile.id);
    lookup[tile.id] = tile;
  }

  return { lookup, ids };
}

function setup() {
  background(0);

  createCanvas(windowWidth, windowHeight);
  pixelSize = round(min(width, height) / DIMENTION);

  for (let x = 0; x < DIMENTION; x++) {
    grid[x] = [];

    for (let y = 0; y < DIMENTION; y++) {
      grid[x][y] = {
        coords: { x, y },
        options: TILES_IDS,
        collapsedId: undefined,
      };
    }
  }

  const collapsingCell = getRandomCellFromGrid();
  collapsingCell.options = [13];
  collapseAndPropagateChanges(collapsingCell);
}

function collapseAndPropagateChanges(cell: Cell) {
  collapseCell(cell);
  drawCell(cell.coords.x, cell.coords.y, getCellColor(cell));
  const neighbors = getNeighbors(cell);

  let changedCellsToUpdate = false;
  neighbors.forEach((neighbor) => {
    reduceOptions(cell, neighbor);

    if (neighbor.options.length === 0) {
      let minxId = max(TILES_IDS);
      let maxId = 0;

      getNeighbors(neighbor).forEach((neighborNeighbor) => {
        if (neighborNeighbor.collapsedId > maxId)
          maxId = neighborNeighbor.collapsedId;
        if (neighborNeighbor.collapsedId < minxId)
          minxId = neighborNeighbor.collapsedId;
      });

      neighbor.collapsedId = undefined;
      neighbor.options = [];

      for (let i = minxId; i <= maxId; i++)
        neighbor.options.push(TILES.find(({ height }) => height === i).id);

      cellsToUpdate.add(neighbor);

      changedCellsToUpdate = true;
    } else if (isCollapsed(neighbor)) verifyCollapse(neighbor);
    else {
      if (neighbor.options.length === 1) cellsToUpdate.add(neighbor);
      else {
        changedCellsToUpdate = true;
        cellsToUpdate.add(neighbor);
      }
    }
  });

  if (changedCellsToUpdate) orderSet();
}

function windowResized() {
  background(0);
  resizeCanvas(windowWidth, windowHeight);
  pixelSize = round(min(width, height) / DIMENTION);
  for (let x = 0; x < DIMENTION; x++) {
    for (let y = 0; y < DIMENTION; y++) {
      const cell = grid[x][y];
      drawCell(x, y, getCellColor(cell));
    }
  }
}

function draw() {
  const size = 32;
  fill("#fff");
  textSize(size);
  text(
    `Updating cell - ${cellsToUpdate.size}`,
    30,
    DIMENTION * pixelSize + size
  );

  try {
    for (let i = 0; i < 100; i++) {
      if (cellsToUpdate.size > 0)
        collapseAndPropagateChanges(cellsToUpdate.values().next().value);
      else break;
    }
  } catch (error) {}
}

function getCellColor(cell: Cell) {
  if (cell.options.length === 0) return "#f00";
  if (!isCollapsed(cell)) return "#ddd";
  return LOOK_UP[cell.collapsedId].color;
}

function drawCell(x: number, y: number, color: string) {
  fill(color);
  noStroke();
  rect(x * pixelSize, y * pixelSize, pixelSize, pixelSize);
}

function getRandomCellFromGrid() {
  const x = floor(random(DIMENTION));
  const y = floor(random(DIMENTION));

  return grid[x][y];
}

function getRandomElementFromArray<T>(array: T[]) {
  return array[floor(random(array.length))];
}

function collapseCell(cell: Cell) {
  if (cell.collapsedId) console.warn("algo errado aconteceu!");
  cellsToUpdate.delete(cell);
  cell.collapsedId = getRandomElementFromArray(cell.options);
}

const getNeighbors = (cell: Cell) => {
  const { x, y } = cell.coords;
  const neighbors: Cell[] = [];

  if (x > 0) neighbors.push(grid[x - 1][y]);
  if (x < DIMENTION - 1) neighbors.push(grid[x + 1][y]);
  if (y > 0) neighbors.push(grid[x][y - 1]);
  if (y < DIMENTION - 1) neighbors.push(grid[x][y + 1]);

  return neighbors;
};

function reduceOptions(originCell: Cell, targetCell: Cell) {
  const originTitle = LOOK_UP[originCell.collapsedId];

  const position = getRelativeCellPosition(originCell, targetCell);
  if (position) {
    const availableOptions = originTitle[position];
    targetCell.options = targetCell.options.filter((id) =>
      availableOptions.includes(id)
    );
    if (targetCell.options.length === 0) {
      console.warn("Beu bosta!");
    }
  }
}

function getRelativeCellPosition(
  originCell: Cell,
  targetCell: Cell
): "top" | "right" | "bottom" | "left" | undefined {
  const { x: originX, y: originY } = originCell.coords;

  const { x: neighborX, y: neighborY } = targetCell.coords;

  if (originX === neighborX) {
    if (originY === neighborY + 1) return "top";
    if (originY === neighborY - 1) return "bottom";
  } else if (originY === neighborY) {
    if (originX === neighborX - 1) return "right";
    if (originX === neighborX + 1) return "left";
  }
  return undefined;
}

function orderSet() {
  const orderedSet = Array.from(cellsToUpdate).sort(
    (a, b) => a.options.length - b.options.length
  );
  cellsToUpdate = new Set(orderedSet);
}

let currentTile: Tile = TILES[0];
function keyPressed() {
  if (keyCode === UP_ARROW) changeCursorTile();
}

function changeCursorTile() {
  const index = TILES.findIndex((tile) => tile.id === currentTile.id);
  if (index === TILES.length - 1) currentTile = TILES[0];
  currentTile = TILES[index + 1];
  console.log(
    "🚀 ~ file: sketch.ts ~ line 273 ~ changeCursorTile ~ currentTile",
    currentTile
  );
}

function mouseClicked() {
  const { x, y } = getCellCordsFromClick(mouseX, mouseY);
  const cell = grid[x][y];
  console.log("🚀 ~ file: sketch.ts ~ line 276 ~ mouseClicked ~ cell", cell);
  cell.options = [currentTile.id];
  collapseAndPropagateChanges(cell);
}

function getCellCordsFromClick(x: number, y: number) {
  return {
    x: floor(x / pixelSize),
    y: floor(y / pixelSize),
  };
}

function verifyCollapse(cell: Cell) {
  const isCollapseValid = cell.options.some((id) => id === cell.collapsedId);
  if (!isCollapseValid) collapseCell(cell);
}

function isCollapsed(cell: Cell) {
  return cell.collapsedId !== undefined;
}
