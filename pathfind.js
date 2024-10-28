document.getElementById('generateButton').addEventListener('click', generateGrid);

function generateGrid() {
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('columns').value);
    const stRow = parseInt(document.getElementById('st-row').value);
    const stCol = parseInt(document.getElementById('st-col').value);
    const edRow = parseInt(document.getElementById('ed-row').value);
    const edCol = parseInt(document.getElementById('ed-col').value);
    const matrixInput = document.getElementById('matrix').value.trim().split("\n");

    if (!rows || !cols) {
        alert("Please enter valid row, column, and matrix values.");
        return;
    }
    if (rows>20)
    {
        alert("Please enter row value under 21.");
    }
    if (cols>40)
    {
        alert("Please enter col value under 41.");
    }
    if (stRow < 1 || stRow > rows || stCol < 1 || stCol > cols || edRow < 1 || edRow > rows || edCol < 1 || edCol > cols) {
        alert("Starting and Ending positions should be within grid bounds.");
        return;
    }
    if (stRow === edRow && stCol === edCol) {
        alert("Starting and Ending positions must be different.");
        return;
    }

    let MatrixInput = [];
    if (matrixInput[0] === '') {
        MatrixInput = generateRandomMatrix(rows, cols, stRow, stCol, edRow, edCol);
        document.getElementById('matrix').value = MatrixInput.map(row => row.join(",")).join("\n");
    }
    else {
        if (matrixInput.length !== rows) {
            alert("Please ensure matrix input matches the row count.");
            return;
        }

        for (let i = 0; i < matrixInput.length; i++) {
            const row = matrixInput[i].split(",").map(Number);
            if (row.length !== cols) {
                alert("Each row in the matrix must have the same number of columns as specified.");
                return;
            }
            MatrixInput.push(row);
        }
    }

    MatrixInput[stRow - 1][stCol - 1] = 'S'; // Start
    MatrixInput[edRow - 1][edCol - 1] = 'E'; // End

    const container = document.getElementById('container');
    container.innerHTML = ''; // Clear any previous grid

    const table = document.createElement('table');
    table.className = 'grid';

    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            td.id = `r${i}c${j}`;

            if (MatrixInput[i][j] === -1) {
                td.className = 'wall'; // Wall
            } else if (MatrixInput[i][j] === 'S') {
                td.className = 'start'; // Start
                td.innerText = 'S';
            } else if (MatrixInput[i][j] === 'E') {
                td.className = 'end'; // End
                td.innerText = 'E';
            } else {
                td.className = 'weighted'; // Weighted Node
                td.innerText = MatrixInput[i][j];
            }
            
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    container.appendChild(table);
    logAction('Grid generated.');
}

function generateRandomMatrix(rows, cols, stRow, stCol, edRow, edCol) {
    const Matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const randomValue = Math.floor(Math.random() * 22) - 1; // Generate -1 to 20
            row.push(randomValue);
        }
        Matrix.push(row);
    }
    Matrix[stRow - 1][stCol - 1] = 0;
    Matrix[edRow - 1][edCol - 1] = 0;
    return Matrix;
}

let paused = false;
let stop = false;
let visited = Array.from({ length: rows }, () => Array(cols).fill(false));
let distance = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
let parent = Array.from({ length: rows }, () => Array(cols).fill(null));

function logAction(message) {
    const log = document.getElementById('log');
    log.value += message + '\n';
    log.scrollTop = log.scrollHeight;
}

function togglePause() {
    paused = !paused;
    document.getElementById('pauseButton').innerText = paused ?  logAction('Paused') : logAction('Resumed');
    document.getElementById('pauseButton').innerText = paused ? 'Resume' : 'Pause';
}

let reset = false;
function resetGrid() {
    reset = true;
    logAction('Grid reset');
    stop = true;
    paused = false;
    document.getElementById('pauseButton').innerText = 'Pause';
    const rows = parseInt(document.getElementById('rows').value);
    const cols = parseInt(document.getElementById('columns').value);
    const matrixInput = document.getElementById('matrix').value.trim().split("\n");
    const stRow = parseInt(document.getElementById('st-row').value);
    const stCol = parseInt(document.getElementById('st-col').value);
    const edRow = parseInt(document.getElementById('ed-row').value);
    const edCol = parseInt(document.getElementById('ed-col').value);

    let MatrixInput = [];
    visited = Array.from({ length: rows }, () => Array(cols).fill(false));
    distance = Array.from({ length: rows }, () => Array(cols).fill(Infinity));
    parent = Array.from({ length: rows }, () => Array(cols).fill(null));

    for (let i = 0; i < matrixInput.length; i++) {
        const row = matrixInput[i].split(",").map(Number);
        if (row.length !== cols) {
            alert("Each row in the matrix must have the same number of columns as specified.");
            return;
        }
        MatrixInput.push(row);
    }

    MatrixInput[stRow - 1][stCol - 1] = 'S';
    MatrixInput[edRow - 1][edCol - 1] = 'E';

    const container = document.getElementById('container');
    container.innerHTML = ''; // Clear any previous grid

    const table = document.createElement('table');
    table.className = 'grid';

    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            td.id = `r${i}c${j}`;

            if (MatrixInput[i][j] === -1) {
                td.className = 'wall'; // Wall
            } else if (MatrixInput[i][j] === 'S') {
                td.className = 'start'; // Start
                td.innerText = 'S';
            } else if (MatrixInput[i][j] === 'E') {
                td.className = 'end'; // End
                td.innerText = 'E';
            } else {
                td.className = 'weighted'; // Weighted Node
                td.innerText = MatrixInput[i][j];
            }
            
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }

    container.appendChild(table);
}

class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    dequeue() {
        return this.elements.shift();
    }

    isEmpty() {
        return this.elements.length === 0;
    }
}

async function dfs(grid, start, end) {
    running = true;
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0]
    ];
    const rows = grid.length;
    const cols = grid[0].length;
    
    async function dfsVisit(row, col, dist) {
        if (stop) {
            return false;
        }
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        visited[row][col] = true;
        logAction(`Visiting node (${row}, ${col})`);
        logAction(`Updating distance of (${row}, ${col}) = (${dist})`);
        await new Promise(resolve => setTimeout(resolve, 200));

        const cellId = `r${row}c${col}`;
        if (stop) return true;
        document.getElementById(cellId).classList.add('visited');
        document.getElementById(cellId).innerText = dist;


        if (row === end[0] && col === end[1]) {
            await new Promise(resolve => setTimeout(resolve, 200));
            logAction(`Reached the end node (${end[0]}, ${end[1]})`);
            logAction(`Minimum distance from start : (${dist})`);
            await new Promise(resolve => setTimeout(resolve, 200));
            const path = retracePath1(parent,start,end);
            highlightPath(path);
            return true;
        }

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow < 0 || newCol < 0 || newRow >= rows || newCol >= cols) continue;
            if (visited[newRow][newCol]) continue;
            if (grid[newRow][newCol]==-1) continue;
            parent[newRow][newCol] = [row, col];
            if (await dfsVisit(newRow, newCol, dist + grid[newRow][newCol])) {
                return true;
            }
        }

        return false;
    }

    return await dfsVisit(start[0], start[1], 0);
}

async function bfs(grid, start, end) {
    running = true;
    const queue = [start];
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0]
    ];
    const rows = grid.length;
    const cols = grid[0].length;
    
    visited[start[0]][start[1]] = true;
    distance[start[0]][start[1]] = 0;

    while (queue.length) {
        if (stop)return true;
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (stop) return true;

        const [r, c, path] = queue.shift();
        const cellId = `r${r}c${c}`;
        
        logAction(`Visiting node (${r}, ${c})`);
        logAction(`Updating distance of (${r}, ${c}) = (${distance[r][c]})`);
        await new Promise(resolve => setTimeout(resolve, 200));
        if (stop) return true;
        document.getElementById(cellId).classList.add('visited');
        document.getElementById(cellId).innerText = distance[r][c];

        await new Promise(resolve => setTimeout(resolve,100));
        
        if (r === end[0] && c === end[1]) {
            logAction(`Reached the end node (${end[0]}, ${end[1]})`);
            logAction(`Minimum distance from start : (${distance[r][c]})`);
            path = retracePath(distance, start, end, grid);
            highlightPath(path);
            if (stop) return true;
            return true;
        }

        for (const [dr, dc] of directions) {
            const newRow = r + dr;
            const newCol = c + dc;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && !visited[newRow][newCol] && grid[newRow][newCol] !== -1) {
                visited[newRow][newCol] = true;
                distance[newRow][newCol] = distance[r][c] + grid[newRow][newCol];
                queue.push([newRow, newCol, [...(path || [[r, c]]), [newRow, newCol]]]);
            }
        }
    }

    return false;
}

async function dijkstra(grid, start, end) {
    
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0]
    ];
    const rows = grid.length;
    const cols = grid[0].length;

    const pq = new PriorityQueue();
    pq.enqueue({ row: start[0], col: start[1] }, 0);
    distance[start[0]][start[1]] = 0;

    while (!pq.isEmpty()) {
        if (stop) return true;
        while (paused) {
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (stop) return true;

        const { row, col } = pq.dequeue().element;
        const cellId = `r${row}c${col}`;

        if (visited[row][col]) continue;

        visited[row][col] = true;
        logAction(`Visiting node (${row}, ${col})`);
        logAction(`Updating distance of (${row}, ${col}) = (${distance[row][col]})`);
        await new Promise(resolve => setTimeout(resolve, 200));

        if (stop) return true;
        document.getElementById(cellId).classList.add('visited');
        document.getElementById(cellId).innerText = distance[row][col];

        await new Promise(resolve => setTimeout(resolve, 100));

        if (row === end[0] && col === end[1]) {
            logAction(`Reached the end node (${end[0]}, ${end[1]})`);
            logAction(`Minimum distance from start : (${distance[row][col]})`);
            await new Promise(resolve => setTimeout(resolve, 200));
            path = retracePath(distance, start, end, grid);
            if (stop) return true;
            highlightPath(path);
            return true;
        }

        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && grid[newRow][newCol] !== -1 && !visited[newRow][newCol]
            ) {
                const newDist = distance[row][col] + grid[newRow][newCol];
                if (newDist < distance[newRow][newCol]) {
                    distance[newRow][newCol] = newDist;
                    pq.enqueue({ row: newRow, col: newCol }, newDist);
                }
            }
        }
    }

    return false;
}

function retracePath1(parent, start, end) {
    let path = [];
    let current = end;
    while (current) {
        path.push(current);
        if (current[0] === start[0] && current[1] === start[1]) {
            break;
        }
        current = parent[current[0]][current[1]];
    }
    return path.reverse();
}

function retracePath(distance, start, end, grid) {
    const path = [];
    let [r, c] = end;
    while (r !== start[0] || c !== start[1]) {
        path.push([r, c]);

        const directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0]
        ];
        let minDist = Infinity;
        let nextCell = null;

        for (const [dr, dc] of directions) {
            const newRow = r + dr;
            const newCol = c + dc;

            if (
                newRow >= 0 && newRow < grid.length &&
                newCol >= 0 && newCol < grid[0].length &&
                distance[newRow][newCol] < minDist
            ) {
                minDist = distance[newRow][newCol];
                nextCell = [newRow, newCol];
            }
        }

        if (!nextCell) break;
        [r, c] = nextCell;
    }

    path.push(start);
    return path.reverse();
}

function highlightPath(path) {
    path.forEach(([r, c], index) => {
        setTimeout(() => {
            document.getElementById(`r${r}c${c}`).classList.add('path');
        }, index * 100);
    });
}

document.getElementById('visualizeButton').addEventListener('click', async () => {
    resetGrid();
    const stRow = parseInt(document.getElementById('st-row').value) - 1;
    const stCol = parseInt(document.getElementById('st-col').value) - 1;
    const edRow = parseInt(document.getElementById('ed-row').value) - 1;
    const edCol = parseInt(document.getElementById('ed-col').value) - 1;
    
    let matrixInput = document.getElementById('matrix').value.trim().split("\n");
    const grid = matrixInput.map(row => row.split(",").map(Number));

    stop = false;
    reset = false;

    let type = document.getElementById('algorithm_type').value;
    if (type === 'dfs') {
        if (!(await dfs(grid, [stRow, stCol], [edRow, edCol]))) {
            alert("No path found!");
        }
    }
    else if (type === 'bfs') {
        if (!(await bfs(grid, [stRow, stCol], [edRow, edCol]))) {
            alert("No path found!");
        }
    }
    else {
        if (!(await dijkstra(grid, [stRow, stCol], [edRow, edCol]))) {
            alert("No path found!");
        }
    }
});
document.getElementById('pauseButton').addEventListener('click', togglePause);
document.getElementById('resetButton').addEventListener('click', resetGrid);