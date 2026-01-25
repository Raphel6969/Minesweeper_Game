const grid_size = 10;
let total_flags = 20;
const total_bombs = 20;
let first_click = false;
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
  let cell_data = getCellDetails(e);
  let cell = getCell(cell_data.x, cell_data.y);
  if (!cell.classList.contains("reveal")) {
    cell.classList.toggle("flag");
    if (cell.classList.contains("flag")) {
      total_flags--;
      mines_left.innerHTML = total_flags;
      console.log(`Flagged: ${cell.id}`);
      grid[cell_data.x][cell_data.y].flagged = true;
    } else {
      total_flags++;
      mines_left.innerHTML = total_flags;
      console.log(`UnFlagged: ${cell.id}`);
      grid[cell_data.x][cell_data.y].flagged = false;
    }
  }
}

function revealBox(e) {
  let cell_data = getCellDetails(e);
  let cell = getCell(cell_data.x, cell_data.y);
  if (!first_click) {
    first_click = true;
    // logic for first cell and making a safe set to ensure its 0 while randomizing bombs
    let x = cell_data.x;
    let y = cell_data.y;
    RandomizeBomb(x, y);
  }
  if (!cell.classList.contains("flag") && !cell.classList.contains("reveal")) {
    let revealed =grid[cell_data.x][cell_data.y].revealed = true;
    // cell.classList.add("reveal");
    if(revealed){
      cell.classList.add("reveal");
    }
    win_lose_condition(cell_data.x, cell_data.y);
    cell.innerHTML = grid[cell_data.x][cell_data.y].value;
    let value = grid[cell_data.x][cell_data.y].value;
    if (value == 0 || value == -1) {
      cell.innerHTML = "";
    } else {
      cell.innerHTML = value;
    }
    console.log(`Revealed: ${cell.id}`);
  }
}

function RandomizeBomb(first_click_x, first_click_y) {
  // let bombs = [];

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
      if (grid[i][j].value === -1) {
        const cell = getCell(i, j);
        cell.classList.remove("reveal");
        cell.classList.add("bomb");
      }
    }
  }
}

function floodFill(){} //TODO: Complete This function

function win_lose_condition(x, y) {
  if (grid[x][y].value === -1 && grid[x][y].revealed) {
    // alert("You lose"); //TODO: Fix losing and replay
    // window.location.reload();
    revealAllBombs();
    // setTimeout(() => alert("You Lose"), 5000); //? Enable Later
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
    window.location.reload();
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
