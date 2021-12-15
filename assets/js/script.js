// this code is using ECMAScript 6 to validate with JShint

/*jshint esversion: 6 */

function getElement(id) {
    return document.getElementById(id);
}

function getElements(className) {
    return document.getElementsByClassName(className);
}

const fireworksContainer = getElement('fireworks');
const fireworks = new Fireworks(fireworksContainer);
fireworks.setOptions({
    delay: {
        min: 0,
        max: 15
    },
    particles: 200,
    explosion: 10,
    speed: 400,
    acceleration: 3000
});

const grid = getElement('grid');
const width = 10;
const height = 20;
const nextPieceGrid = getElement('next-piece');
const scoreElement = getElement('score');
const levelElement = getElement('speed');
const colorClasses = [
    "dark-blue-box",
    "blue-box",
    "green-box",
    "orange-box",
    "purple-box",
    "red-box",

];

const dropIntervals = [800, 700, 600, 500, 400, 300, 250, 200, 150, 100];
const maxLevel = 10;
// create grid for tetris

function createGrids() {
    for (let i = 0; i < height; i++) {
        const row = document.createElement('div');
        row.className = 'row';
        row.id = `row-${i}`;
        for (let j = 0; j < width; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.id = `cell-${i}-${j}`;
            row.appendChild(cell);
        }
        grid.appendChild(row);
    }
    for (let i = 0; i < 5; i++) {
        const row = document.createElement('div');
        row.className = 'row-next';
        row.id = `rowNext-${i}`;
        for (let j = 0; j < 5; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell-next';
            cell.id = `cellNext-${i}-${j}`;
            row.appendChild(cell);
        }
        nextPieceGrid.appendChild(row);
    }
}


// create tetris shapes
const iShape = [
    [1, 1, 1, 1]
];
const oShape = [
    [1, 1],
    [1, 1]
];
const tShape = [
    [1, 1, 1],
    [0, 1, 0]
];
const lShape = [
    [1, 0],
    [1, 0],
    [1, 1]
];
const jShape = [
    [0, 1],
    [0, 1],
    [1, 1]
];
const zShape = [
    [1, 1, 0],
    [0, 1, 1]
];
const sShape = [
    [0, 1, 1],
    [1, 1, 0]
];
const shapes = [iShape, oShape, tShape, lShape, jShape, zShape, sShape];


function getRandomShape() {
    return shapes[Math.floor(Math.random() * shapes.length)];
}


function getNextPiece() {
    return {
        shape: getRandomShape(),
        row: 0,
        col: 3,
        color: colorClasses[Math.floor(Math.random() * colorClasses.length)],
        placed: false
    }
}


function drawPiece(piece) {
    let row = piece.row;
    let col = piece.col;
    let shape = piece.shape;
    let color = piece.color;
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
                getElement(`cell-${row + i}-${col + j}`).classList.add('active-piece');
                getElement(`cell-${row + i}-${col + j}`).classList.add(color);
            }
        }
    }
}

function drawNextPiece(piece) {
    let row = piece.row;
    let col = piece.col;
    let shape = piece.shape;
    let color = piece.color;
    for (let i = 0; i < shape.length; i++) {
        for (let j = 0; j < shape[i].length; j++) {
            if (shape[i][j] === 1) {
                getElement(`cellNext-${row + i + 1}-${col + j - 2}`).classList.add('active-piece');
                getElement(`cellNext-${row + i + 1}-${col + j - 2}`).classList.add(color);
            }
        }
    }
}

function undrawPiece(piece) {
    if (piece) {
        let row = piece.row;
        let col = piece.col;
        let shape = piece.shape;
        let color = piece.color;
        for (let i = 0; i < shape.length; i++) {
            for (let j = 0; j < shape[i].length; j++) {
                if (shape[i][j] === 1) {
                    getElement(`cell-${row + i}-${col + j}`).classList.remove('active-piece');
                    getElement(`cell-${row + i}-${col + j}`).classList.remove(color);
                }
            }
        }

    }
}

function undrawNextPiece(piece) {
    let color = piece.color;
    let cells = getElements('cell-next');
    for (let i = 0; i < cells.length; i++) {
        cells[i].classList.remove('active-piece');
        cells[i].classList.remove(color);
    }
}

function movePieceLeft(piece) {
    undrawPiece(piece);
    if (piece.col > 0 && isVacantLeft(piece)) {
        piece.col--;
    }
    drawPiece(piece);
}

function movePieceRight(piece) {
    undrawPiece(piece);
    if (piece.col + piece.shape[0].length <= 9 && isVacantRight(piece)) {
        piece.col++;
    }
    drawPiece(piece);
}

function movePieceDown(piece) {
    if (piece) {
        undrawPiece(piece);
        if (piece.row + piece.shape.length < 20 && !checkCollision(piece)) {
            piece.row++;
        }
        drawPiece(piece);
    }
}


function rotatePiece(piece) {
    undrawPiece(piece);
    let width = piece.shape[0].length;
    let height = piece.shape.length;
    let temp = [];
    for (let i = 0; i < width; i++) {
        temp[i] = [];
        for (let j = 0; j < height; j++) {
            temp[i][j] = piece.shape[height - 1 - j][i];
        }
    }
    piece.shape = temp;
    while (piece.col + piece.shape[0].length > 9 || !isVacantRight(piece)) {
        piece.col--;
    }
    while (piece.col < 0 || !isVacantLeft(piece)) {
        piece.col++;
    }
    while (piece.row + piece.shape.length > 20 || checkCollision(piece)) {
        piece.row--;
    }
    drawPiece(piece);
}


function isVacantLeft(piece) {
    let col = piece.col;
    let row = piece.row;
    let height = piece.shape.length;
    let width = piece.shape[0].length;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (col > 0) {
                if (piece.shape[i][j] === 1 && getElement(`cell-${row + i}-${col - 1}`).classList.contains('taken')) {
                    return false;
                }
            }
        }
    }
    return true;
}

function isVacantRight(piece) {
    let col = piece.col;
    let row = piece.row;
    let height = piece.shape.length;
    let width = piece.shape[0].length;
    for (let i = 0; i < height; i++) {
        for (let j = 0; j < width; j++) {
            if (col + width < 10) {
                if (piece.shape[i][j] === 1 && getElement(`cell-${row + i}-${col + width}`).classList.contains('taken')) {
                    return false;
                }
            }
        }
    }
    return true;
}



function checkCollision(piece) {
    if (piece) {

        let row = piece.row;
        let col = piece.col;
        let shape = piece.shape;
        let width = piece.shape[0].length;
        let height = piece.shape.length;
        if (row + height >= 20) {
            return true;
        } else {
            for (let i = 0; i < height; i++) {
                for (let j = 0; j < width; j++) {
                    if (shape[i][j] === 1) {
                        if (getElement(`cell-${row + i + 1}-${col + j}`).classList.contains('taken')) {
                            return true;
                        }
                    }
                }
            }
        }
        return false;
    }
}

function restoreIdOrder() {
    let rows = getElements('row');
    for (let i = 0; i < rows.length; i++) {
        rows[i].id = `row-${i}`;
        let cells = rows[i].children;
        for (let j = 0; j < cells.length; j++) {
            cells[j].id = `cell-${i}-${j}`;
        }
    }
}

function clearLines() {
    let rows = grid.children;
    let count = 0;
    for (let i = 0; i < rows.length; i++) {
        let cells = rows[i].children;
        let full = true;
        for (let j = 0; j < cells.length; j++) {
            if (!cells[j].classList.contains('taken')) {
                full = false;
                break;
            }
        }
        if (full) {
            count++;
            for (let k = 0; k < cells.length; k++) {
                cells[k].classList.remove('taken');
            }
            grid.removeChild(rows[i]);
            let row = document.createElement('div');
            row.className = 'row';
            row.id = `row-${i}`;
            for (let l = 0; l < width; l++) {
                let cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${i}-${l}`;
                row.appendChild(cell);
            }
            grid.insertBefore(row, rows[0]);
        }
    }
    if (count > 0) {
        score += (count * 10);
        fireworks.start();
        setTimeout(() => {
            fireworks.stop();
        }, 1200);

        updateScore();
    }
}

function updateScore() {
    scoreElement.innerHTML = score;
}

function updateLevel() {
    levelElement.innerHTML = level;
}

function incrementDifficulty() {
    level = Math.floor(score / 50);
    if (level < maxLevel) {
        level++;
        updateLevel();
        clearInterval(gameInterval);
        currentInterval = dropIntervals[level - 1];
        runGame();
    }
}

function pieceControls(event) {
    if (event.key === "ArrowLeft") {
        movePieceLeft(currentPiece);
    } else if (event.key === "ArrowRight") {
        movePieceRight(currentPiece);
    } else if (event.key === "ArrowUp") {
        rotatePiece(currentPiece);
    } else if (event.key === "ArrowDown") {
        movePieceDown(currentPiece);
    }
}

// Buttons 
const startButton = getElement('start');
const pauseButton = getElement('pause');
const resetButton = getElement('reset');

// Game functions
let gameOver = false;
let gamePaused = false;
let gameStarted = false;
let gameInterval;
let currentPiece;
let nextPiece;
let score = 0;
let level = 1;
let currentInterval = dropIntervals[level - 1];
// TETRIS

function runGame() {
    if (!gameStarted && !gameOver) {
      startButton.removeEventListener("click", runGame);
      startButton.classList.add('btn-disabled');
      startButton.classList.remove('btn-game');
      gameStarted = true;
      document.addEventListener("keydown", pieceControls);
      currentPiece = getNextPiece();
      drawPiece(currentPiece);
      nextPiece = getNextPiece();
      drawNextPiece(nextPiece);
      gameInterval = setInterval(() => {
        restoreIdOrder();
        checkGameOver(currentPiece);
        incrementDifficulty();

        if (checkCollision(currentPiece)) {
          currentPiece.placed = true;
          currentPiece.shape.forEach((row, i) => {
            row.forEach((cell, j) => {
              if (cell === 1) {
                getElement(
                  `cell-${currentPiece.row + i}-${currentPiece.col + j}`
                ).classList.remove("active-piece");
                getElement(
                  `cell-${currentPiece.row + i}-${currentPiece.col + j}`
                ).classList.add("taken");
              }
            });
          });
          clearLines();
          restoreIdOrder();
          currentPiece = nextPiece;
          undrawNextPiece(nextPiece);
          nextPiece = getNextPiece();
          drawNextPiece(nextPiece);
        }
        movePieceDown(currentPiece);
      }, currentInterval);
    } else if (gameStarted && !gameOver) {
      gamePaused = false;
      pauseButton.innerText = "Pause";
      document.addEventListener("keydown", pieceControls);
      gameInterval = setInterval(() => {
        restoreIdOrder();
        checkGameOver(currentPiece);
        incrementDifficulty();

        if (checkCollision(currentPiece)) {
          currentPiece.placed = true;
          currentPiece.shape.forEach((row, i) => {
            row.forEach((cell, j) => {
              if (cell === 1) {
                getElement(
                  `cell-${currentPiece.row + i}-${currentPiece.col + j}`
                ).classList.remove("active-piece");
                getElement(
                  `cell-${currentPiece.row + i}-${currentPiece.col + j}`
                ).classList.add("taken");
              }
            });
          });
          clearLines();
          restoreIdOrder();
          currentPiece = nextPiece;
          undrawNextPiece(nextPiece);
          nextPiece = getNextPiece();
          drawNextPiece(nextPiece);
        }
        movePieceDown(currentPiece);
      }, currentInterval);
    }
}

function pauseGame() {
    if (gameStarted && !gamePaused) {
        gamePaused = true;
        clearInterval(gameInterval);
        pauseButton.innerText = "Resume";
        currentPiece = currentPiece;
        document.removeEventListener("keydown", pieceControls);
        startButton.removeEventListener("click", runGame);
    } else if (gameStarted && gamePaused) {
        runGame();
    }
}

function resetGame() {
    gameStarted = false;
    gameOver = false;
    gamePaused = false;
    currentPiece = null;
    nextPiece = null;
    clearInterval(gameInterval);
    score = 0;
    level = 1;
    currentInterval = dropIntervals[level - 1];
    updateScore();
    updateLevel();
    getElement('grid').innerHTML = '';
    getElement('next-piece').innerHTML = '';
    document.removeEventListener("keydown", pieceControls);
    createGrids();
    pauseButton.innerText = "Pause";
    startButton.addEventListener("click", runGame);
    startButton.classList.remove('btn-disabled');
    startButton.classList.add('btn-game');
}

function checkGameOver(piece) {
    if (piece.row === 0 && checkCollision(piece)) {
        gameOver = true;
        gameStarted = false;
        gamePaused = false;
        currentPiece = null;
        nextPiece = null;
        clearInterval(gameInterval);
        pauseButton.innerText = "Pause";
        document.removeEventListener("keydown", pieceControls);
        alert('GameOver!')
    }

}


createGrids();
startButton.addEventListener('click', runGame);
pauseButton.addEventListener('click', pauseGame);
resetButton.addEventListener('click', resetGame);