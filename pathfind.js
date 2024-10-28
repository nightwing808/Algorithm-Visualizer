document.getElementById('generateButton').addEventListener('click', generateGrid);

// Function to generate the grid based on user input
function generateGrid() {
    const rows = parseInt(document.getElementById('rows').value); // Number of rows
    const cols = parseInt(document.getElementById('columns').value); // Number of columns
    const stRow = parseInt(document.getElementById('st-row').value); // Start row
    const stCol = parseInt(document.getElementById('st-col').value); // Start column
    const edRow = parseInt(document.getElementById('ed-row').value); // End row
    const edCol = parseInt(document.getElementById('ed-col').value); // End column
    const matrixInput = document.getElementById('matrix').value.trim().split("\n"); // Matrix input

    // Validate row and column input
    if (!rows || !cols) {
        alert("Please enter valid row, column, and matrix values.");
        return;
    }
    if (rows > 20) {
        alert("Please enter row value under 21.");
    }
    if (cols > 40) {
        alert("Please enter col value under 41.");
    }

    // Validate start and end positions
    if (stRow < 1 || stRow > rows || stCol < 1 || stCol > cols || edRow < 1 || edRow > rows || edCol < 1 || edCol > cols) {
        alert("Starting and Ending positions should be within grid bounds.");
        return;
    }
    if (stRow === edRow && stCol === edCol) {
        alert("Starting and Ending positions must be different.");
        return;
    }

    // Initialize the matrix input
    let MatrixInput = [];
    if (matrixInput[0] === '') {
        // Generate a random matrix if no input is provided
        MatrixInput = generateRandomMatrix(rows, cols, stRow, stCol, edRow, edCol);
        document.getElementById('matrix').value = MatrixInput.map(row => row.join(",")).join("\n");
    } else {
        // Validate the input matrix format
        if (matrixInput.length !== rows) {
            alert("Please ensure matrix input matches the row count.");
            return;
        }

        // Process each row in the input matrix
        for (let i = 0; i < matrixInput.length; i++) {
            const row = matrixInput[i].split(",").map(Number);
            if (row.length !== cols) {
                alert("Each row in the matrix must have the same number of columns as specified.");
                return;
            }
            MatrixInput.push(row);
        }
    }

    // Set start and end points in the matrix
    MatrixInput[stRow - 1][stCol - 1] = 'S'; // Start
    MatrixInput[edRow - 1][edCol - 1] = 'E'; // End

    const container = document.getElementById('container');
    container.innerHTML = ''; // Clear any previous grid

    const table = document.createElement('table');
    table.className = 'grid';

    // Generate table rows and cells based on the matrix
    for (let i = 0; i < rows; i++) {
        const tr = document.createElement('tr');
        for (let j = 0; j < cols; j++) {
            const td = document.createElement('td');
            td.id = `r${i}c${j}`;

            // Set cell classes based on matrix values
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

// Function to generate a random matrix with specific dimensions and start/end positions
function generateRandomMatrix(rows, cols, stRow, stCol, edRow, edCol) {
    const Matrix = [];
    for (let i = 0; i < rows; i++) {
        const row = [];
        for (let j = 0; j < cols; j++) {
            const randomValue = Math.floor(Math.random() * 22) - 1; // Generate values from -1 to 20
            row.push(randomValue);
        }
        Matrix.push(row);
    }
    Matrix[stRow - 1][stCol - 1] = 0; // Ensure start is not a wall
    Matrix[edRow - 1][edCol - 1] = 0; // Ensure end is not a wall
    return Matrix;
}

let paused = false; // Pause state
let stop = false; // Stop state
let visited = Array.from({ length: rows }, () => Array(cols).fill(false)); // Visited nodes
let distance = Array.from({ length: rows }, () => Array(cols).fill(Infinity)); // Distance matrix
let parent = Array.from({ length: rows }, () => Array(cols).fill(null)); // Parent matrix

// Function to log actions in a text area
function logAction(message) {
    const log = document.getElementById('log');
    log.value += message + '\n';
    log.scrollTop = log.scrollHeight;
}

// Toggle pause state and update button text
function togglePause() {
    paused = !paused;
    document.getElementById('pauseButton').innerText = paused ?  logAction('Paused') : logAction('Resumed');
    document.getElementById('pauseButton').innerText = paused ? 'Resume' : 'Pause';
}

let reset = false; // Reset state
// Reset the grid to its initial state
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

// Priority queue class to manage nodes in Dijkstra's algorithm
class PriorityQueue {
    constructor() {
        this.elements = [];
    }

    // Enqueue element with priority
    enqueue(element, priority) {
        this.elements.push({ element, priority });
        this.elements.sort((a, b) => a.priority - b.priority);
    }

    // Dequeue element with highest priority
    dequeue() {
        return this.elements.shift();
    }

    // Check if queue is empty
    isEmpty() {
        return this.elements.length === 0;
    }
}

// Function to handle DFS traversal in a grid with start and end points
async function dfs(grid, start, end) {
    running = true;
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0] // Directions for moving right, down, left, and up
    ];
    const rows = grid.length;
    const cols = grid[0].length;
    
    // Recursive function to visit nodes in DFS order
    async function dfsVisit(row, col, dist) {
        if (stop) {
            return false; // Terminate if stop flag is set
        }
        while (paused) { // Pause execution if the pause flag is set
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        visited[row][col] = true; // Mark the node as visited
        logAction(`Visiting node (${row}, ${col})`);
        logAction(`Updating distance of (${row}, ${col}) = (${dist})`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay for visualization

        const cellId = `r${row}c${col}`; // Select cell by ID for updating the DOM
        if (stop) return true;
        document.getElementById(cellId).classList.add('visited');
        document.getElementById(cellId).innerText = dist;

        // Check if end node is reached
        if (row === end[0] && col === end[1]) {
            await new Promise(resolve => setTimeout(resolve, 200));
            logAction(`Reached the end node (${end[0]}, ${end[1]})`);
            logAction(`Minimum distance from start : (${dist})`);
            await new Promise(resolve => setTimeout(resolve, 200));
            const path = retracePath1(parent, start, end); // Trace path to visualize
            highlightPath(path);
            return true;
        }

        // Explore neighbors based on directions array
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            if (newRow < 0 || newCol < 0 || newRow >= rows || newCol >= cols) continue; // Boundary check
            if (visited[newRow][newCol]) continue; // Skip visited nodes
            if (grid[newRow][newCol] === -1) continue; // Skip wall nodes
            parent[newRow][newCol] = [row, col]; // Set parent for path tracing
            if (await dfsVisit(newRow, newCol, dist + grid[newRow][newCol])) {
                return true; // Exit early if path to end is found
            }
        }

        return false; // Return false if no path found
    }

    return await dfsVisit(start[0], start[1], 0); // Initialize DFS from the start node
}

// Function to handle BFS traversal in a grid with start and end points
async function bfs(grid, start, end) {
    running = true;
    const queue = [start]; // Initialize queue with start node
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0] // Directions for moving right, down, left, and up
    ];
    const rows = grid.length;
    const cols = grid[0].length;
    
    visited[start[0]][start[1]] = true; // Mark start node as visited
    distance[start[0]][start[1]] = 0; // Initialize distance at start node

    while (queue.length) { // Loop while nodes remain in queue
        if (stop) return true; // Exit if stop flag is set
        while (paused) { // Pause if paused flag is set
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (stop) return true;

        const [r, c, path] = queue.shift(); // Dequeue a node
        const cellId = `r${r}c${c}`; // Get cell ID for updating DOM
        
        logAction(`Visiting node (${r}, ${c})`);
        logAction(`Updating distance of (${r}, ${c}) = (${distance[r][c]})`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay for visualization
        if (stop) return true;
        document.getElementById(cellId).classList.add('visited');
        document.getElementById(cellId).innerText = distance[r][c];

        await new Promise(resolve => setTimeout(resolve,100));
        
        if (r === end[0] && c === end[1]) { // Check if end node is reached
            logAction(`Reached the end node (${end[0]}, ${end[1]})`);
            logAction(`Minimum distance from start : (${distance[r][c]})`);
            path = retracePath(distance, start, end, grid); // Trace path to visualize
            highlightPath(path);
            if (stop) return true;
            return true;
        }

        // Enqueue neighbors
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

    return false; // Return false if no path found
}

// Function to execute Dijkstra's algorithm in a grid
async function dijkstra(grid, start, end) {
    
    const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0] // Directions for moving right, down, left, and up
    ];
    const rows = grid.length;
    const cols = grid[0].length;

    const pq = new PriorityQueue(); // Initialize priority queue
    pq.enqueue({ row: start[0], col: start[1] }, 0);
    distance[start[0]][start[1]] = 0;

    while (!pq.isEmpty()) { // Loop while priority queue is not empty
        if (stop) return true;
        while (paused) { // Pause if paused flag is set
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        if (stop) return true;

        const { row, col } = pq.dequeue().element;
        const cellId = `r${row}c${col}`; // Get cell ID for updating DOM

        if (visited[row][col]) continue; // Skip already visited nodes

        visited[row][col] = true; // Mark node as visited
        logAction(`Visiting node (${row}, ${col})`);
        logAction(`Updating distance of (${row}, ${col}) = (${distance[row][col]})`);
        await new Promise(resolve => setTimeout(resolve, 200)); // Delay for visualization

        if (stop) return true;
        document.getElementById(cellId).classList.add('visited');
        document.getElementById(cellId).innerText = distance[row][col];

        await new Promise(resolve => setTimeout(resolve, 100));

        if (row === end[0] && col === end[1]) { // Check if end node is reached
            logAction(`Reached the end node (${end[0]}, ${end[1]})`);
            logAction(`Minimum distance from start : (${distance[row][col]})`);
            await new Promise(resolve => setTimeout(resolve, 200));
            path = retracePath(distance, start, end, grid); // Trace path to visualize
            if (stop) return true;
            highlightPath(path);
            return true;
        }

        // Explore neighbors and update distances
        for (const [dr, dc] of directions) {
            const newRow = row + dr;
            const newCol = col + dc;
            
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && grid[newRow][newCol] !== -1 && !visited[newRow][newCol]) {
                const newDist = distance[row][col] + grid[newRow][newCol];
                if (newDist < distance[newRow][newCol]) {
                    distance[newRow][newCol] = newDist;
                    pq.enqueue({ row: newRow, col: newCol }, newDist);
                }
            }
        }
    }

    return false; // Return false if no path found
}

// Function to retrace path in DFS
function retracePath1(parent, start, end) {
    // Initialize path array to store the final path from end to start
    let path = [];
    let current = end;

    // Traverse back from end to start using the parent matrix
    while (current) {
        path.push(current); // Add current position to path

        // Break if we have reached the start position
        if (current[0] === start[0] && current[1] === start[1]) {
            break;
        }

        // Move to the parent of the current position
        current = parent[current[0]][current[1]];
    }

    // Return the path in the correct order from start to end
    return path.reverse();
}

// Function to retrace path in BFS,Dijkstra
function retracePath(distance, start, end, grid) {
    // Initialize path array to store the final path from end to start
    const path = [];
    let [r, c] = end;

    // Traverse from end to start by finding neighboring cells with minimum distance values
    while (r !== start[0] || c !== start[1]) {
        path.push([r, c]); // Add the current cell to the path

        const directions = [
            [0, 1], [1, 0], [0, -1], [-1, 0]
        ];
        let minDist = Infinity;
        let nextCell = null;

        // Check neighboring cells to find the one with the minimum distance value
        for (const [dr, dc] of directions) {
            const newRow = r + dr;
            const newCol = c + dc;

            // Ensure the cell is within bounds and has a smaller distance value
            if (
                newRow >= 0 && newRow < grid.length &&
                newCol >= 0 && newCol < grid[0].length &&
                distance[newRow][newCol] < minDist
            ) {
                minDist = distance[newRow][newCol];
                nextCell = [newRow, newCol];
            }
        }

        // If no next cell is found, break out of the loop
        if (!nextCell) break;

        // Move to the neighboring cell with the minimum distance
        [r, c] = nextCell;
    }

    // Add the start cell to the path and return the path in the correct order
    path.push(start);
    return path.reverse();
}

function highlightPath(path) {
    // Highlight each cell in the path sequentially
    path.forEach(([r, c], index) => {
        setTimeout(() => {
            // Add 'path' class to the cell to visually highlight it
            document.getElementById(`r${r}c${c}`).classList.add('path');
        }, index * 100); // Delay between highlights to show the path progressively
    });
}

document.getElementById('visualizeButton').addEventListener('click', async () => {
    // Reset the grid before starting visualization
    resetGrid();

    // Get start and end coordinates from input fields
    const stRow = parseInt(document.getElementById('st-row').value) - 1;
    const stCol = parseInt(document.getElementById('st-col').value) - 1;
    const edRow = parseInt(document.getElementById('ed-row').value) - 1;
    const edCol = parseInt(document.getElementById('ed-col').value) - 1;
    
    // Parse the input matrix to create the grid for pathfinding
    let matrixInput = document.getElementById('matrix').value.trim().split("\n");
    const grid = matrixInput.map(row => row.split(",").map(Number));

    stop = false; // Reset stop flag
    reset = false; // Reset reset flag

    // Determine the algorithm type from the selected value
    let type = document.getElementById('algorithm_type').value;

    // Execute the selected pathfinding algorithm
    if (type === 'dfs') {
        // Execute DFS and alert if no path is found
        if (!(await dfs(grid, [stRow, stCol], [edRow, edCol]))) {
            alert("No path found!");
        }
    }
    else if (type === 'bfs') {
        // Execute BFS and alert if no path is found
        if (!(await bfs(grid, [stRow, stCol], [edRow, edCol]))) {
            alert("No path found!");
        }
    }
    else {
        // Execute Dijkstra and alert if no path is found
        if (!(await dijkstra(grid, [stRow, stCol], [edRow, edCol]))) {
            alert("No path found!");
        }
    }
});

// Add event listeners for pause and reset buttons
document.getElementById('pauseButton').addEventListener('click', togglePause);
document.getElementById('resetButton').addEventListener('click', resetGrid);
