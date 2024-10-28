// Function to parse the adjacency list input and convert it to a usable graph structure
function parseAdjacencyList(adjacencyListInput, isWeighted, isDirected) {
    // Split input into lines, parse number of nodes, edges, and start node from the first line
    const lines = adjacencyListInput.trim().split('\n');
    const [n, m ,start] = lines[0].split(' ').map(Number);
    const adjacencyList = {};

    // Process each edge
    for (let i = 1; i <= m; i++) {
        const edge = lines[i].split(' ').map(Number);
        const node1 = edge[0];
        const node2 = edge[1];
        const weight = isWeighted ? (edge[2] !== undefined ? edge[2] : 1) : 1;
        
        // Add edges to adjacency list, ensuring each node is initialized as an array
        if (!adjacencyList[node1]) {
            adjacencyList[node1] = [];
        }
        if (!adjacencyList[node2]) {
            adjacencyList[node2] = [];
        }
        adjacencyList[node1].push({ node: node2, weight });

        // If the graph is undirected, add the reverse edge as well
        if (!isDirected) {
            if (!adjacencyList[node2]) {
                adjacencyList[node2] = [];
            }
            adjacencyList[node2].push({ node: node1, weight });
        }
    }

    // Define the start node with a default of 1 if none is provided
    const startNode = start || 1;

    return { adjacencyList, nodeCount: n, edgeCount: m ,startNode: startNode};
}

// Function to log messages to a textarea for user feedback
function logAction(message) {
    const log = document.getElementById('log');
    log.value += message + '\n';
    log.scrollTop = log.scrollHeight;
}

// Function to print the adjacency list to the log
function printAdjacencyListInLog(adjacencyList) {
    let logText = 'Adjacency List:\n';
    
    for (const node in adjacencyList) {
        const neighbors = adjacencyList[node].map(neighbor => {
            return neighbor.weight !== undefined
                ? `(${neighbor.node}, ${neighbor.weight})`
                : neighbor.node;
        }).join(', ');

        logText += `${node} -> ${neighbors}\n`;
    }

    logAction(logText);
}

// Function to draw the graph using the vis.js library
function drawGraph(adjacencyListInput, isWeighted, isDirected) {
    // Parse adjacency list and node count from input
    const { adjacencyList, nodeCount } = parseAdjacencyList(adjacencyListInput, isWeighted, isDirected);

    // Create nodes with unique ids
    const nodes = [];
    for (let i = 1; i <= nodeCount; i++) {
        nodes.push({ id: i, label: `${i}` });
    }

    // Create edges between nodes with optional weight labels
    const edges = [];
    for (const node in adjacencyList) {
        adjacencyList[node].forEach(edge => {
            edges.push({
                parent: Number(node),
                from: Number(node),
                to: edge.node,
                label: isWeighted ? `${edge.weight}` : '',
            });
        });
    }

    // Setup graph container and options
    const container = document.getElementById('container');
    const data = { nodes: new vis.DataSet(nodes), edges: new vis.DataSet(edges) };
    const options = {
        edges: {
            arrows: { to: { enabled: isDirected } },
            font: { align: 'middle' },
            color: '#ffffff',
            width: 5,
            smooth: {
                enabled: true,
                type: 'curvedCCW',
                roundness: 0.1
            },
        },
        nodes: {
            shape: 'circle',
            size: 20,
            font: { size: 20, color: '#fff'},
            color: { background: '#6c757d', border: '#343a40' }
        },
        interaction: {
            hover: true
        },
        physics: {
            enabled: true
        }
    };

     // Create network visualization and print adjacency list to log
    const network = new vis.Network(container, data, options);
    printAdjacencyListInLog(adjacencyList);

    return network;
}

// Event listener for generating the graph from input fields
document.getElementById('generateButton').addEventListener('click', function () {
    const adjacencyListInput = document.getElementById('Adjacency List').value.trim();
    const isWeighted = document.getElementById('Weight').value === 'weighted';
    const isDirected = document.getElementById('direction').value === 'directed';

    if (adjacencyListInput) {
        drawGraph(adjacencyListInput, isWeighted, isDirected);
    } else {
        alert('Please provide a valid adjacency list.');
    }
});

// Function to highlight a specific node in the network with a given color
function highlightNode(nodeId, color, network) {
    const updateNode = { id: nodeId, color: { background: color, border: '#343a40' } };
    network.body.data.nodes.update(updateNode);
}

// Function to highlight an edge between two nodes in the network
function highlightEdge(fromNode, toNode, color, network) {
    const edge = network.body.data.edges.get({
        filter: (edge) => (edge.from === fromNode && edge.to === toNode)
    });

    if (edge.length > 0) {
        for (let i=0; i<edge.length; i++) {
            if (edge[i].from === fromNode && edge[i].to === toNode) {
                network.body.data.edges.update({ id: edge[i].id, color: { color: color } });
                return;
            }
        }
    }
}
// Controls for pausing and resuming algorithm visualizations
let pauseFlag = false;
let paused = null;

function checkPaused() {
    if (pauseFlag) {
        return new Promise(resolve => {
            paused = resolve;
        })
    }
    return Promise.resolve();
}

// Implementation of BFS with node and edge highlighting
async function bfs(adjacencyList, startNode, network) {
    // BFS initialization with a queue, visited set, and tracking previous nodes
    const queue = new Queue();
    const visited = new Set();
    const previous = {};
    const distances = {};

    queue.enqueue(startNode);
    visited.add(startNode);
    previous[startNode] = null;
    distances[startNode] = 0;

    logAction(`Starting BFS from node ${startNode}`);
    highlightNode(startNode, 'green', network);

    while (!queue.isEmpty()) {
        await checkPaused();
        const currentNode = queue.dequeue();
        logAction(`Visiting node ${currentNode}`);

        // Process each neighbor and update visualization accordingly
        for (const neighbor of adjacencyList[currentNode]) {
            await checkPaused();
            if (!visited.has(neighbor.node)) {
                visited.add(neighbor.node);
                queue.enqueue(neighbor.node);

                distances[neighbor.node] = distances[currentNode] + neighbor.weight;
                previous[neighbor.node] = currentNode;
                highlightEdge(currentNode, neighbor.node, 'blue', network);
                highlightNode(neighbor.node, 'red', network);
                logAction(`Queueing node ${neighbor.node}`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        // Color back edges and previous nodes to represent BFS progress
        if (previous[currentNode] !== null) {
            highlightEdge(previous[currentNode], currentNode, 'green', network);
        }
        if (currentNode !== startNode) highlightNode(currentNode, 'orange', network);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Delay of 1 second between processing
    }

    // Log the final distances from start node to each other node
    logAction("BFS complete.");
    logAction("Distances from the start node:");
    for (const node in distances) {
        logAction(`Node ${node}: Distance = ${distances[node]}`);
    }
}

// Function to perform Depth-First Search (DFS) with visualization
async function dfs(adjacencyList, startNode, network) {
    const visited = new Set();
    const previous = {};
    const distances = {};

    // Mark the starting node as visited and highlight it in the network
    visited.add(startNode);
    previous[startNode] = null;
    distances[startNode] = 0;

    logAction(`Starting DFS from node ${startNode}`);
    highlightNode(startNode, 'green', network);

    
    async function dfsRecursive(node, currentDistance) {
        await checkPaused();
        logAction(`Visiting node ${node}`);
        if (node !== startNode) highlightNode(node, 'orange', network);

        const edgesToCurrent = [];

        // Recursively visit each unvisited neighbor
        for (const neighbor of adjacencyList[node]) {
            await checkPaused();
            if (!visited.has(neighbor.node)) {
                visited.add(neighbor.node);
                previous[neighbor.node] = node;
                distances[neighbor.node] = currentDistance + neighbor.weight;

                highlightEdge(node, neighbor.node,'blue', network);
                highlightNode(neighbor.node, 'red', network);
                logAction(`Exploring node ${neighbor.node}`);

                await new Promise(resolve => setTimeout(resolve, 1000));

                await dfsRecursive(neighbor.node, distances[neighbor.node]);

                edgesToCurrent.push({from: node, to: neighbor.node});
            }
        }

         // Backtrack color to indicate completion
        if (previous[node] !== null) {
            highlightEdge(previous[node], node, 'green', network);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        edgesToCurrent.forEach(edge => {
            highlightEdge(edge.from, edge.to , 'green', network);
        })
    }

    await dfsRecursive(startNode, 0);
    logAction("DFS complete.");
    logAction("Distances from the start node:");
    for (const node in distances) {
        logAction(`Node ${node}: Distance = ${distances[node]}`);
    }
}

// Implementation of Dijkstra's Algorithm for finding shortest paths
async function dijkstra(adjacencyList, startNode, network) {
    const distances = {};// Track minimum distance to each node
    const previous = {};// Track previous node in the shortest path
    const pq = new MinPriorityQueue();

    // Initialize distances and add the start node to the priority queue
    for (const node in adjacencyList) {
        distances[node] = Infinity;
        previous[node] = null;
    }
    distances[startNode] = 0;
    pq.enqueue(startNode, 0);

    logAction(`Starting Dijkstra from node ${startNode}`);
    highlightNode(startNode, 'green', network);

    while (!pq.isEmpty()) {
        await checkPaused();
        const { element: currentNode } = pq.dequeue();
        
        logAction(`Visiting node ${currentNode} with distance ${distances[currentNode]}`);
        if (currentNode !== startNode) highlightNode(currentNode, 'red', network);

        if (previous[currentNode]) {
            highlightEdge(previous[currentNode], currentNode, 'green', network);
        }

        // Visit each neighbor of the current node
        for (const neighbor of adjacencyList[currentNode]) {
            await checkPaused();
            const distance = distances[currentNode] + neighbor.weight;
            
            // Update the shortest path if a shorter path is found
            if (distance < distances[neighbor.node]) {
                distances[neighbor.node] = distance;
                previous[neighbor.node] = currentNode;

                pq.enqueue(neighbor.node, distance);

                // Visual feedback for the path and neighbor
                highlightEdge(currentNode, neighbor.node, 'blue', network);
                highlightNode(neighbor.node, 'orange', network);
                logAction(`Updating distance of node ${neighbor.node} to ${distance}`);
            }
            
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Mark the processed node
        if (currentNode !== startNode) highlightNode(currentNode, 'orange', network);

        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    // Log final distances for each node from the start node
    logAction("Dijkstra's algorithm complete.");
    logAction("Final distances from the start node:");
    for (const node in distances) {
        logAction(`Node ${node}: Distance = ${distances[node]}`);
    }
}

// Function to perform Topological Sort using Kahn's Algorithm
async function topologicalSort(adjacencyList, nodeCount, isDirected, network) {
    if (!isDirected) {
        logAction("Topological Sort only works on directed graphs.");
        return;
    }

    // Initialize in-degrees of all nodes
    const inDegree = new Array(nodeCount + 1).fill(0); 
    const topologicalOrder = [];
    const queue = new Queue();

    for (const node in adjacencyList) {
        for (const neighbor of adjacencyList[node]) {
            inDegree[neighbor.node]++;
        }
    }

    // Enqueue nodes with in-degree 0 (no dependencies)
    for (let i = 1; i <= nodeCount; i++) {
        if (inDegree[i] === 0) {
            queue.enqueue(i);
            highlightNode(i, 'green', network);
            logAction(`Node ${i} has no incoming edges, adding to queue`);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }

    // Process nodes in topological order
    while (!queue.isEmpty()) {
        await checkPaused();
        const currentNode = queue.dequeue();
        topologicalOrder.push(currentNode);
        logAction(`Processing node ${currentNode}`);

        // Visit each neighbor and decrease in-degree
        for (const neighbor of adjacencyList[currentNode]) {
            await checkPaused();
            logAction(`Decreasing indegree of ${neighbor.node} by 1`);
            inDegree[neighbor.node]--;

            if (inDegree[neighbor.node] === 0) {
                queue.enqueue(neighbor.node);
                highlightEdge(currentNode, neighbor.node, 'blue', network);
                highlightNode(neighbor.node, 'green', network);
                logAction(`Node ${neighbor.node} now has no incoming edges, adding to queue`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            } else {
                highlightNode(neighbor.node, 'green', network);
                highlightEdge(currentNode, neighbor.node, 'blue', network);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
    }

    // Log the topological sort order
    if (topologicalOrder.length !== nodeCount) {
        logAction("The graph has a cycle, so topological sorting is not possible.");
    } else {
        logAction("Topological Sort complete.");
        logAction("Topological Order: " + topologicalOrder.join(", "));
    }
}
// Queue class for standard queue operations
class Queue {
    constructor() {
        this.items = []; // Initialize an empty array to store queue elements
    }

    // Add an element to the end of the queue
    enqueue(element) {
        this.items.push(element);
    }

    // Remove and return the first element of the queue
    dequeue() {
        if (this.isEmpty()) {
            return "Queue is empty"; // Return message if queue is empty
        }
        return this.items.shift();
    }

    // Check if the queue is empty
    isEmpty() {
        return this.items.length === 0;
    }

    // Get the first element without removing it
    front() {
        if (this.isEmpty()) {
            return "Queue is empty"; // Return message if queue is empty
        }
        return this.items[0];
    }

    // Get the number of elements in the queue
    size() {
        return this.items.length;
    }
}

// MinPriorityQueue class for a priority queue with minimum priority as the highest priority
class MinPriorityQueue {
    constructor() {
        this.items = []; // Initialize an empty array for queue items
    }

    // Add an element to the queue with a given priority
    enqueue(element, priority) {
        const queueElement = { element, priority }; // Create an object for the element and its priority
        let added = false;

        // Loop through queue to find correct insertion point based on priority
        for (let i = 0; i < this.items.length; i++) {
            if (this.items[i].priority > queueElement.priority) {
                this.items.splice(i, 0, queueElement); // Insert at correct position based on priority
                added = true;
                break;
            }
        }

        // If element has the lowest priority, add it at the end
        if (!added) {
            this.items.push(queueElement);
        }
    }

    // Remove and return the element with the highest priority (lowest priority value)
    dequeue() {
        return this.items.shift();
    }

    // Check if the priority queue is empty
    isEmpty() {
        return this.items.length === 0;
    }
}

// Event listener for visualizeButton to trigger graph visualization and algorithm selection
document.getElementById('visualizeButton').addEventListener('click', function () {
    const algorithmType = document.getElementById('algorithm_type').value; // Selected algorithm type
    const adjacencyListInput = document.getElementById('Adjacency List').value.trim(); // Get and trim adjacency list input
    const isWeighted = document.getElementById('Weight').value === 'weighted'; // Check if graph is weighted
    const isDirected = document.getElementById('direction').value === 'directed'; // Check if graph is directed

    // Parse adjacency list and other properties
    const { adjacencyList, startNode, nodeCount} = parseAdjacencyList(adjacencyListInput, isWeighted, isDirected);

    // Draw the graph network
    const network = drawGraph(adjacencyListInput, isWeighted, isDirected);

    // Log starting node information
    logAction(startNode);

    // Execute algorithm based on selected type
    if (algorithmType == 'dijkstra') {
        logAction('dijkstra');
        dijkstra(adjacencyList, startNode, network); // Run Dijkstra's algorithm
    } else if (algorithmType == 'bfs') {
        logAction('bfs');
        bfs(adjacencyList, startNode, network); // Run Breadth-First Search
    } else if (algorithmType == 'dfs') {
        logAction('dfs');
        dfs(adjacencyList, startNode, network); // Run Depth-First Search
    } else if (algorithmType === 'top_sort') {
        topologicalSort(adjacencyList, nodeCount, isDirected, network); // Run Topological Sort for directed graphs
    }
});

// Event listener for pauseButton to handle pausing and resuming the visualization
document.getElementById('pauseButton').addEventListener('click', function () {
    pauseFlag = !pauseFlag; // Toggle pause flag

    if (!pauseFlag) {
        // If resuming, trigger the paused function to continue, then clear paused state
        if (paused) {
            paused();
            paused = null;
        }
        this.textContent = 'pause'; // Update button text to indicate next action
    } else {
        this.textContent = 'resume'; // Update button text to indicate next action
    }
});
