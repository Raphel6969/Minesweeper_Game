

const grid_size = 10;
let total_flags = 20;
let grid = Array.from({ length: grid_size }, () =>
  new Array(grid_size).fill(0),
);

let board = document.getElementById("board");
let mines_left = document.querySelector(".mine_left");

function renderBoard() {
  for (let i = 0; i < grid_size; i++) {
    for (let j = 0; j < grid_size; j++) {
      board.innerHTML += `<div class="cell" id="cell${String(i) + String(j)}"></div>`;
      grid[i][j] = { value: 0, revealed: false, flagged: false }; //TODO: initialised on render (fix)
    }
  }
}

function getCellDetails(e) {
  let clicked_id = e.target.attributes.id.value;
  let clicked_x = clicked_id[4]; //TODO: Refactor Logic
  let clicked_y = clicked_id[5];
  let mouse_event = e.button; // 0 == left 2 == right
  const cell_data = {
    x: clicked_x,
    y: clicked_y,
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
  if (!cell.classList.contains("flag") && !cell.classList.contains("reveal")) {
    cell.classList.add("reveal");
    grid[cell_data.x][cell_data.y].revealed = true;
    cell.innerHTML = grid[cell_data.x][cell_data.y].value;
    console.log(`Revealed: ${cell.id}`);
  }
}

function RandomizeBomb() {
  
}

renderBoard();
board.addEventListener("click", (e) => {
  revealBox(e);
});
board.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  markFlag(e);
});
