const grid_size = 10;
const total_bombs = 20;
let total_flags = total_bombs;
let first_click = false;
let game_running = true;
const box_set = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

let board = document.getElementById("board");
let mines_left = document.querySelector(".mine_left");

let grid = Array.from({ length: grid_size }, () =>
  new Array(grid_size).fill(0),
);

//initialising grid initially
for (let i = 0; i < grid_size; i++) {
  for (let j = 0; j < grid_size; j++) {
    grid[i][j] = { value: 0, revealed: false, flagged: false };
  }
}

function renderBoard() {
  for (let i = 0; i < grid_size; i++) {
    for (let j = 0; j < grid_size; j++) {
      board.innerHTML += `<div class="cell" id="cell${String(i) + String(j)}"></div>`;
    }
  }
}

function getCellDetails(e) {
  let clicked_id = e.target.attributes.id.value;
  let clicked_x = clicked_id[4]; //TODO: Refactor Logic
  let clicked_y = clicked_id[5];
  let mouse_event = e.button; // 0 == left 2 == right
  const cell_data = {
    x: parseInt(clicked_x),
    y: parseInt(clicked_y),
    mouse_button: mouse_event,
  };
  return cell_data;
}

function getCell(x, y) {
  const cell = document.querySelector(`#cell${String(x) + String(y)}`);
  return cell;
}

function markFlag(e) {
  if (!game_running) {
    return;
  }

  let cell_data = getCellDetails(e);
  let cell = getCell(cell_data.x, cell_data.y);
  if (!cell.classList.contains("reveal")) {
    grid[cell_data.x][cell_data.y].flagged =
      !grid[cell_data.x][cell_data.y].flagged;
    if (grid[cell_data.x][cell_data.y].flagged) {
      total_flags--;
      mines_left.innerHTML = total_flags;
      cell.classList.add("flag");
      console.log(`Flagged: ${cell.id}`);
    } else {
      total_flags++;
      mines_left.innerHTML = total_flags;
      cell.classList.remove("flag");
      console.log(`UnFlagged: ${cell.id}`);
    }

    // cell.classList.toggle("flag");
    // if (cell.classList.contains("flag")) {
    //   total_flags--;
    //   mines_left.innerHTML = total_flags;
    //   console.log(`Flagged: ${cell.id}`);
    //   grid[cell_data.x][cell_data.y].flagged = true;
    // } else {
    //   total_flags++;
    //   mines_left.innerHTML = total_flags;
    //   console.log(`UnFlagged: ${cell.id}`);
    //   grid[cell_data.x][cell_data.y].flagged = false;
    // }
  }
}

function revealBox(e) {
  if (!game_running) {
    return;
  }

  let cell_data = getCellDetails(e);
  let cell = getCell(cell_data.x, cell_data.y);
  if (!first_click) {
    first_click = true;
    let x = cell_data.x;
    let y = cell_data.y;

    // remove all flags
    for (let i = 0; i < grid_size; i++) {
      for (let j = 0; j < grid_size; j++) {
        if (grid[i][j].flagged) {
          grid[i][j].flagged = false;
          const cell = getCell(i, j);
          cell.classList.remove("flag");
        }
      }
    }

    RandomizeBomb(x, y);
  }
  if (!cell.classList.contains("flag") && !cell.classList.contains("reveal")) {
    let revealed = (grid[cell_data.x][cell_data.y].revealed = true);
    if (revealed) {
      cell.classList.add("reveal");
    }
    cell.innerHTML = grid[cell_data.x][cell_data.y].value;
    let value = grid[cell_data.x][cell_data.y].value;
    if (value === 0) {
      floodFill(cell_data.x, cell_data.y);
    }
    win_lose_condition(cell_data.x, cell_data.y);

    cell.innerHTML = value === 0 || value === -1 ? "" : value;
    console.log(`Revealed: ${cell.id}`);
  }
}

function RandomizeBomb(first_click_x, first_click_y) {
  let safe_set = [];
  safe_set.push([first_click_x, first_click_y]);
  for (const [dx, dy] of box_set) {
    safe_set.push([dx + first_click_x, dy + first_click_y]);
  }
  console.log(first_click_x, first_click_y, safe_set);

  let randomnumbers = new Set(),
    bombs;
  while (randomnumbers.size < total_bombs) {
    let coord = Math.floor(Math.random() * 100); //*Can switch to (rx,ry) algo (later)
    let [x, y] = [Math.floor(coord / grid_size), Math.floor(coord % grid_size)];
    if (!safe_set.some(([sx, sy]) => sx === x && sy === y)) {
      randomnumbers.add(coord);
    }
  }
  bombs = [...randomnumbers];

  for (let i = 0; i < bombs.length; i++) {
    let x = Math.floor(bombs[i] / grid_size);
    let y = Math.floor(bombs[i] % grid_size);
    grid[x][y].value = -1;
  }

  getAddress(bombs);
  console.log(bombs);
}

function getAddress() {
  for (let i = 0; i < grid_size; i++) {
    for (let j = 0; j < grid_size; j++) {
      if (grid[i][j].value !== -1) {
        let count = 0;
        for (const [dx, dy] of box_set) {
          let x = dx + i;
          let y = dy + j;
          if (
            x >= 0 &&
            x < grid_size &&
            y >= 0 &&
            y < grid_size &&
            grid[x][y].value === -1
          ) {
            count++;
          }
        }
        grid[i][j].value = count;
      }
    }
  }
}

function revealAllBombs() {
  for (let i = 0; i < grid_size; i++) {
    for (let j = 0; j < grid_size; j++) {
      if (grid[i][j].value !== -1 && grid[i][j].flagged) {
        const cell = getCell(i, j);
        cell.classList.remove("flag");
        cell.classList.add("wrong");
      }
      if (grid[i][j].value === -1 && !grid[i][j].flagged) {
        const cell = getCell(i, j);
        cell.classList.remove("reveal");
        cell.classList.add("bomb");
      }
    }
  }
}

function floodFill(startX, startY) {
  let queue = [[startX, startY]];

  while (queue.length > 0) {
    const [x, y] = queue.shift();

    for (const [dx, dy] of box_set) {
      const nx = x + dx;
      const ny = y + dy;

      if (nx >= 0 && nx < grid_size && ny >= 0 && ny < grid_size) {
        const cell = grid[nx][ny];
        if (cell.revealed || cell.flagged) continue;
        cell.revealed = true;
        const dom = getCell(nx, ny);
        dom.classList.add("reveal");
        if (cell.value > 0) {
          dom.innerHTML = cell.value;
        }
        if (cell.value === 0) {
          queue.push([nx, ny]);
        }
      }
    }
  }
}

function win_lose_condition(x, y) {
  if (grid[x][y].value === -1 && grid[x][y].revealed) {
    revealAllBombs();
    setTimeout(() => alert("You Lose"), 5000);
    setTimeout(() => window.location.reload(), 10000);
    game_running = false;
    return;
  }

  let revealed = 0;

  for (let i = 0; i < grid_size; i++) {
    for (let j = 0; j < grid_size; j++) {
      if (grid[i][j].value !== -1 && grid[i][j].revealed) {
        revealed++;
      }
    }
  }
  if (revealed === grid_size * grid_size - total_bombs) {
    alert("you win!!");
    game_running = false;
    setTimeout(() => window.location.reload(), 5000);
  }
}

renderBoard();
board.addEventListener("click", (e) => {
  revealBox(e);
});
board.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  markFlag(e);
});
