const SIZE = 10;
const LETTERS = "ABCDEFGHIJ";
const TURN_TIME = 180;

const EMPTY_GAME_STATE = {
  phase: "placing",
  orientation: "horizontal",
  shipsToPlace: [2, 3, 5],
  currentTurn: "player",

  timer: {
    turnStart: null,
    duration: TURN_TIME
  },

  player: {
    ships: [],
    hits: [],
    misses: [],
    score: 0,
    turns: 0
  },

  computer: {
    ships: [],
    hits: [],
    misses: [],
    score: 0,
    turns: 0
  }
};

let gameState = loadState() ?? structuredClone(EMPTY_GAME_STATE);

const playerBoard = document.getElementById("playerBoard");
const computerBoard = document.getElementById("computerBoard");
const statusEl = document.getElementById("status");
const timerEl = document.getElementById("timer");

document.getElementById("rotateBtn").onclick = rotateShip;
document.getElementById("restart").onclick = restartGame;

render();
resumeTimer();

function saveState() {
  localStorage.setItem("battleshipGame", JSON.stringify(gameState));
}

function loadState() {
  return JSON.parse(localStorage.getItem("battleshipGame"));
}

function rotateShip() {
  gameState.orientation =
    gameState.orientation === "horizontal" ? "vertical" : "horizontal";
  saveState();
}

function coordToIndex(r, c) {
  return r * SIZE + c;
}

function indexToCoord(i) {
  return { r: Math.floor(i / SIZE), c: i % SIZE };
}

function renderBoard(boardEl, owner) {
  boardEl.innerHTML = "";

  boardEl.appendChild(document.createElement("div"));
  for (let i = 1; i <= 10; i++) {
    const lbl = document.createElement("div");
    lbl.textContent = i;
    lbl.className = "label";
    boardEl.appendChild(lbl);
  }

  for (let r = 0; r < SIZE; r++) {
    const lbl = document.createElement("div");
    lbl.textContent = LETTERS[r];
    lbl.className = "label";
    boardEl.appendChild(lbl);

    for (let c = 0; c < SIZE; c++) {
      const cell = document.createElement("div");
      cell.className = "cell";
      const idx = coordToIndex(r, c);

      if (owner === "player") {
        if (gameState.player.ships.includes(idx)) cell.classList.add("ship");
        if (gameState.player.hits.includes(idx)) cell.classList.add("hit");
        if (gameState.player.misses.includes(idx)) cell.classList.add("miss");
        cell.onclick = () => placeShip(idx);
      } else {
        if (gameState.computer.hits.includes(idx)) cell.classList.add("hit");
        if (gameState.computer.misses.includes(idx)) cell.classList.add("miss");
        cell.onclick = () => playerFire(idx);
      }

      boardEl.appendChild(cell);
    }
  }
}

function render() {
  renderBoard(playerBoard, "player");
  renderBoard(computerBoard, "computer");

  document.getElementById("playerScore").textContent = gameState.player.score;
  document.getElementById("computerScore").textContent = gameState.computer.score;

  if (gameState.phase === "placing") {
    statusEl.textContent = `Place ship size ${gameState.shipsToPlace[0]}`;
  } else if (gameState.phase === "playing") {
    statusEl.textContent = `Turn: ${gameState.currentTurn}`;
  }
}

function placeShip(startIndex) {
  if (gameState.phase !== "placing") return;

  const size = gameState.shipsToPlace[0];
  const { r, c } = indexToCoord(startIndex);
  let cells = [];

  for (let i = 0; i < size; i++) {
    const nr = gameState.orientation === "horizontal" ? r : r + i;
    const nc = gameState.orientation === "horizontal" ? c + i : c;
    if (nr >= SIZE || nc >= SIZE) return;
    cells.push(coordToIndex(nr, nc));
  }

  fetch("/battleship/api/validate.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cells,
      existing: gameState.player.ships
    })
  })
    .then(res => res.json())
    .then(data => {
      if (!data.valid) return;

      gameState.player.ships.push(...cells);
      gameState.shipsToPlace.shift();

      if (gameState.shipsToPlace.length === 0) {
        gameState.phase = "playing";
        initComputerShips();
        startTurn();
      }

      saveState();
      render();
    });
}

function initComputerShips() {
  if (gameState.computer.ships.length) return;

  [2, 3, 5].forEach(size => {
    let placed = false;
    while (!placed) {
      const start = Math.floor(Math.random() * 100);
      const orient = Math.random() < 0.5 ? "horizontal" : "vertical";
      const { r, c } = indexToCoord(start);
      let cells = [];

      for (let i = 0; i < size; i++) {
        const nr = orient === "horizontal" ? r : r + i;
        const nc = orient === "horizontal" ? c + i : c;
        if (nr >= SIZE || nc >= SIZE) break;
        cells.push(coordToIndex(nr, nc));
      }

      if (
        cells.length === size &&
        cells.every(c => !gameState.computer.ships.includes(c))
      ) {
        gameState.computer.ships.push(...cells);
        placed = true;
      }
    }
  });
}

function startTurn() {
  gameState.timer.turnStart = Date.now();
  saveState();
  resumeTimer();

  if (gameState.currentTurn === "computer") {
    setTimeout(computerFire, 800);
  }
}

function resumeTimer() {
  if (gameState.phase !== "playing") return;

  clearInterval(window.timerInterval);
  window.timerInterval = setInterval(() => {
    const elapsed = Math.floor(
      (Date.now() - gameState.timer.turnStart) / 1000
    );
    const remaining = gameState.timer.duration - elapsed;
    timerEl.textContent = Math.max(0, remaining);

    if (remaining <= 0) {
      clearInterval(window.timerInterval);
      endTurn();
    }
  }, 500);
}

function playerFire(idx) {
  if (gameState.phase !== "playing") return;
  if (gameState.currentTurn !== "player") return;
  if (
    gameState.computer.hits.includes(idx) ||
    gameState.computer.misses.includes(idx)
  ) return;

  gameState.player.turns++;

  if (gameState.computer.ships.includes(idx)) {
    gameState.computer.hits.push(idx);
    gameState.player.score++;
  } else {
    gameState.computer.misses.push(idx);
  }

  endTurn();
}

function computerFire() {
  let idx;
  do {
    idx = Math.floor(Math.random() * 100);
  } while (
    gameState.player.hits.includes(idx) ||
    gameState.player.misses.includes(idx)
  );

  gameState.computer.turns++;

  if (gameState.player.ships.includes(idx)) {
    gameState.player.hits.push(idx);
    gameState.computer.score++;
  } else {
    gameState.player.misses.push(idx);
  }

  endTurn();
}

function endTurn() {
  logStats();
  checkWin();

  gameState.currentTurn =
    gameState.currentTurn === "player" ? "computer" : "player";

  startTurn();
  saveState();
  render();
}

function checkWin() {
  if (gameState.computer.hits.length === gameState.computer.ships.length) {
    finishGame("Player");
  }
  if (gameState.player.hits.length === gameState.player.ships.length) {
    finishGame("Computer");
  }
}

function finishGame(winner) {
  gameState.phase = "ended";
  document.getElementById("winnerText").textContent =
    `${winner} wins! Player ${gameState.player.score} - Computer ${gameState.computer.score}`;
  document.getElementById("endScreen").classList.remove("hidden");
  saveState();
}

function restartGame() {
  localStorage.removeItem("battleshipGame");
  location.reload();
}

function logStats() {
  fetch("/battleship/api/log.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(gameState)
  });
}
