let heights = [];
let bars = [];
let barValues = [];

let barSlider = document.getElementById('barSlider');
let n = barSlider.value;
let speedSlider = document.getElementById('speedSlider');
let delay = 375 - speedSlider.value;
let RUN = 10;

let container = document.getElementById('container');
let width = container.offsetWidth;
let height = container.offsetHeight-30;
let lineWidth = width / n - 1;

let isStopped = true;
let isPaused = false;
let isGenerated = true;
let isSorted = false;

class Stack {
    constructor() {
        this.arr = [];
        this.top = -1;
    }
    push(element) {
        this.top++;
        this.arr.push(element);
    }
    isEmpty() {
        return this.top == -1;
    }
    pop() {
        if (this.isEmpty() === false) {
            this.top = this.top - 1;
            return this.arr.pop();
        }
    }
}

function getRandomValue(min, max) {
    // Generates a random number between min and max
    return Math.random() * (max - min) + min;
}

function generateRandomArray() {
    // Clears the log area if it exists
    const Log = document.getElementById('log');
    if (Log) Log.value = '';

    // Logs the action of generating a random array
    logAction('Random Array Generated ^_^');

    // Flags to track array generation, sorting status, and controls
    isGenerated = true;
    isSorted = false;
    isStopped = true;
    isPaused = false;

    // Setting the number of bars and their width based on slider value
    n = barSlider.value;
    lineWidth = width / n - 1;
    container.innerHTML = '';

    // Generate the array of bars with random heights
    for (let i = 0; i < n; i++) {
        heights[i] = parseInt(getRandomValue(1, height));

        // Create and style each bar element
        bars.push(document.createElement('div'));
        bars[i].style.width = `${lineWidth}px`;
        bars[i].style.height = `${heights[i]}px`;
        bars[i].style.transform = `translate(${i * lineWidth + i}px)`;
        bars[i].style.backgroundColor = 'white';
        bars[i].className = 'bar';

        // Append the bar to the container
        container.appendChild(bars[i]);

        // For small arrays, display values above each bar
        if (n <= 50) {
            barValues.push(document.createElement('div'));
            barValues[i].innerHTML = heights[i];
            barValues[i].style.marginBottom = `${heights[i] + 5}px`;
            barValues[i].style.transform = `translate(${i * lineWidth + i}px)`;
            barValues[i].className = 'barValue';

            // Append bar value to the container
            container.appendChild(barValues[i]);
        }
    }
}

// Call the function to generate the initial random array
generateRandomArray();

function swap(i, minindex) {
    // Swap the heights of the bars
    [heights[i], heights[minindex]] = [heights[minindex], heights[i]];

    // Swap the bars' positions in the DOM array and visually
    [bars[i], bars[minindex]] = [bars[minindex], bars[i]];
    [bars[i].style.transform, bars[minindex].style.transform] = [
        bars[minindex].style.transform,
        bars[i].style.transform
    ];

    // Swap the displayed bar values if they exist
    [barValues[i], barValues[minindex]] = [barValues[minindex], barValues[i]];
    [barValues[i].style.transform, barValues[minindex].style.transform] = [
        barValues[minindex].style.transform,
        barValues[i].style.transform
    ];
}

function draw(coloredBars, colors) {
    // Reset all bars to the default white color
    for (let i = 0; i < n; i++) {
        bars[i].style.backgroundColor = 'white';

        // Set specified bars to provided colors
        for (let j = 0; j < coloredBars.length; j++) {
            if (i == coloredBars[j]) {
                bars[i].style.backgroundColor = colors[j];
                break;
            }
        }
    }
}

function sleep(ms) {
    // Helper function to create a delay for async operations
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function SortedAnimation() {
    // Animate bars turning lime green to indicate sorting completion
    for (let i = 0; i < n; i++) {
        bars[i].style.backgroundColor = 'lime';
        await sleep(10);
    }

    // Pause before resetting colors back to white
    await sleep(300);
    for (let i = 0; i < n; i++) {
        bars[i].style.backgroundColor = 'white';
        await sleep(10);
    }
}

async function bubbleSort() {
    // Loop through each pass of the array for Bubble Sort
    for (let i = 0; i < n - 1; i++) {
        logAction(`Iteration ${i + 1}: Starting to check elements`);

        // Inner loop to compare and swap adjacent elements
        for (let j = 0; j < n - i - 1; j++) {
            // Stop the algorithm if stopped flag is set
            if (isStopped) {
                draw([], []);
                return;
            }

            // Check if the algorithm is not paused
            if (!isPaused) {
                // If current element is greater than the next, swap them
                if (heights[j] > heights[j + 1]) {
                    logAction(`Swapping index ${j} and index ${j + 1}`);
                    swap(j, j + 1);
                }

                // Highlight the elements being compared
                draw([j, j + 1], ['green', 'yellow']);
            } else {
                // If paused, repeat the last comparison
                j--;
            }

            // Delay between each comparison for visualization
            await sleep(delay);
        }

        // Log the array state after each outer loop iteration
        let new_arr = [];
        for (let j = 0; j < n ; j++) {
            new_arr[j] = heights[j];
        }
        logAction(`Array after iteration ${i + 1}: [${new_arr}]`);
    }

    // Log completion of Bubble Sort
    logAction("Bubble sort completed");
    draw([], []);

    // Set flags to indicate sorting is complete
    isSorted = true;
    isStopped = true;
    isPaused = false;

    // Call animation to indicate completion
    SortedAnimation();
}

async function selectionSort() {
    // Loop through each pass of the array for Selection Sort
    for (let i = 0; i < n - 1; i++) {
        // Initialize the minimum index to the start of the unsorted part
        let minIndex = i;
        logAction(`Starting iteration ${i + 1}, finding minimum from index ${i}`);

        // Inner loop to find the minimum element in the unsorted part
        for (let j = i + 1; j < n; j++) {
            // Stop the algorithm if stopped flag is set
            if (isStopped) {
                draw([], []);
                return;
            }

            // Check if the algorithm is not paused
            if (!isPaused) {
                // Update the minimum index if a new minimum is found
                if (heights[j] < heights[minIndex]) {
                    logAction(`New minimum found: ${heights[j]}`);
                    minIndex = j;
                }

                // Highlight the current element, minimum element, and starting element
                draw([i, j, minIndex], ['blue', 'red', 'green']);
            } else {
                // If paused, repeat the last comparison
                j--;
            }

            // Delay between each comparison for visualization
            await sleep(delay);
        }

        // Swap the found minimum element with the starting element of the unsorted part
        swap(i, minIndex);
        logAction(`Swapping element ${heights[i]} with new minimum ${heights[minIndex]}`);
    }

    // Log completion of Selection Sort
    logAction("Selection sort completed");
    draw([], []);

    // Set flags to indicate sorting is complete
    isSorted = true;
    isStopped = true;
    isPaused = false;

    // Call animation to indicate completion
    SortedAnimation();
}
async function insertionSort() {
    // Loop through each element in the array for Insertion Sort
    for (let i = 0; i < n; i++) {
        // Set the current element as the key to be inserted
        let key = heights[i];
        let j;

        // Loop through the sorted part of the array to find the correct position for the key
        for (j = i - 1; j >= 0 && heights[j] > key; j--) {
            // Stop the algorithm if stopped flag is set
            if (isStopped) {
                draw([], []);
                return;
            }

            // Check if the algorithm is not paused
            if (!isPaused) {
                // Swap the elements to shift them right, making space for the key
                swap(j, j + 1);

                // Highlight the elements being compared and shifted
                draw([j, i + 1], ['green', 'red']);
            } else {
                // If paused, repeat the last comparison
                j++;
            }

            // Delay between each comparison for visualization
            await sleep(delay);
        }

        // Log the position the key was inserted into
        logAction(`${key} shifted from index ${i} to index ${j + 1}`);
    }

    // Log completion of Insertion Sort
    logAction("Insertion sort completed");
    draw([], []);

    // Set flags to indicate sorting is complete
    isSorted = true;
    isStopped = true;
    isPaused = false;

    // Call animation to indicate completion
    SortedAnimation();
}

async function mergeSort() {
    // Loop to set the size of subarrays to be merged for each pass
    for (let curSize = 1; curSize < n; curSize *= 2) {
        logAction(`Current merge size: ${curSize}`);

        // Loop through each subarray pair for merging
        for (let start = 0; start < n - 1; start += 2 * curSize) {
            // Define mid and end indices for the current subarrays
            let mid = Math.min(start + curSize - 1, n - 1);
            let end = Math.min(start + 2 * curSize - 1, n - 1);

            // Calculate sizes of two subarrays and create temporary arrays L and R
            let n1 = mid - start + 1;
            let n2 = end - mid;
            let L = [], R = [];

            // Copy elements to L and R
            for (let i = 0; i < n1; i++) L.push(heights[start + i]);
            for (let j = 0; j < n2; j++) R.push(heights[mid + 1 + j]);

            logAction(`Merging subarrays from ${start} to ${mid} and ${mid + 1} to ${end}`);

            // Initialize pointers for L, R, and merged array
            let i = 0, j = 0, k = start;

            // Prepare indices and colors for bars during merging
            let barsIndices = [];
            let barsColors = [];
            for (let i1 = start; i1 <= end; i1++) {
                barsIndices.push(i1);
                barsColors.push('yellow');
            }

            // Merge the L and R arrays back into the main array
            while (i < n1 || j < n2) {
                // Stop the algorithm if stopped flag is set
                if (isStopped) {
                    draw([], []);
                    return;
                }

                // Check if the algorithm is not paused
                if (!isPaused) {
                    // Merge L[i] if it is smaller or if R is exhausted
                    if (j == n2 || (i < n1 && L[i] <= R[j])) {
                        draw([k, ...barsIndices], ['green', ...barsColors]);
                        i++;
                    } else {
                        // Shift elements in the main array to merge R[j]
                        for (let i1 = mid + 1 + j; i1 > k; i1--) {
                            swap(i1, i1 - 1);
                        }
                        draw([k, ...barsIndices], ['green', ...barsColors]);
                        j++;
                    }
                    k++;
                }

                // Delay between each comparison for visualization
                await sleep(delay);
            }
        }
    }

    // Log completion of Merge Sort
    logAction('Merge sort completed');
    draw([], []);

    // Set flags to indicate sorting is complete
    isSorted = true;
    isStopped = true;
    isPaused = false;

    // Call animation to indicate completion
    SortedAnimation();
}

async function quickSort() {
    // Initialize stack to keep track of subarray indices for iterative Quick Sort
    let s = new Stack();
    s.push(0); // Push initial low index
    s.push(n - 1); // Push initial high index

    // Process elements in stack until all subarrays are sorted
    while (!s.isEmpty()) {
        // Pop high and low indices
        let h = s.pop();
        let l = s.pop();
        logAction(`Popped indices: l = ${l}, h = ${h}`);

        // Initialize partition index
        let i = l - 1;
        let barsIndices = [];
        let barsColors = [];
        for (let i1 = l; i1 <= h; i1++) {
            barsIndices.push(i1);
            barsColors.push('yellow');
        }

        // Partitioning phase
        logAction(`Partitioning array between indices l = ${l} and h = ${h}`);
        for (let j = l; j <= h - 1; j++) {
            if (isStopped) {
                draw([], []);
                return;
            }
            if (!isPaused) {
                // Highlight current elements being compared
                draw([i, j, ...barsIndices], ['green', 'red', ...barsColors]);

                // Swap elements if they meet partition condition
                if (heights[j] <= heights[h]) {
                    i++;
                    logAction(`Swapping elements at indices ${i} and ${j}`);
                    swap(i, j);
                }
            } else {
                j--; // Pause handling
            }
            await sleep(delay);
        }

        // Swap pivot element with partition index
        swap(i + 1, h);
        logAction(`Swapping pivot element at index ${h} with element at index ${i + 1}`);

        // Partitioning index for further subarray processing
        let partition = i + 1;
        logAction(`Partition index: ${partition}`);

        // Push left subarray indices onto the stack if applicable
        if (l < partition - 1) {
            s.push(l);
            s.push(partition - 1);
            logAction(`Pushing indices: l = ${l}, h = ${partition - 1}`);
        }

        // Push right subarray indices onto the stack if applicable
        if (partition + 1 < h) {
            s.push(partition + 1);
            s.push(h);
            logAction(`Pushing indices: l = ${partition + 1}, h = ${h}`);
        }
    }

    // Final actions upon Quick Sort completion
    logAction('Quick sort completed');
    draw([], []);
    isSorted = true;
    isStopped = true;
    isPaused = false;
    SortedAnimation();
}

async function insertionSortTim(left, right) {
    // Iterate through each element in the given range for Insertion Sort
    for (let i = left ; i <= right; i++) {
        let key = heights[i];

        // Shift elements to the right until the correct position for the key is found
        for (let j = i - 1; j >= left && heights[j] > key; j--) {
            if (isStopped) {
                draw([], []);
                return;
            }
            if (!isPaused) {
                // Swap adjacent elements for shifting
                swap(j, j + 1);

                // Highlight the elements being compared and shifted
                draw([j, i + 1], ['green', 'red']);
            } else {
                j++; // Pause handling
            }
            await sleep(delay);
        }
    }
}

async function timSort() {
    let n = heights.length;

    // Apply Insertion Sort on small subarrays of size RUN
    for (let i = 0; i < n; i += RUN) {
        await insertionSortTim(i, Math.min(i + RUN - 1, n - 1));
        logAction(`Sorted small chunk from index ${i} to ${Math.min(i + RUN - 1, n - 1)}: [${heights.slice(i, i + RUN).join(", ")}]`);
    }

    // Merge sorted subarrays to increase sorted chunk size on each pass
    for (let size = RUN; size < n; size = 2 * size) {
        for (let start = 0; start < n - 1; start += 2 * size) {
            let mid = Math.min(start + size - 1, n - 1);
            let end = Math.min(start + 2 * size - 1, n - 1);
            logAction(`Merging subarrays from ${start} to ${mid} and ${mid + 1} to ${end}`);

            // Create temporary arrays for merging
            let n1 = mid - start + 1;
            let n2 = end - mid;
            let L = [], R = [];
            for (let i = 0; i < n1; i++) L.push(heights[start + i]);
            for (let j = 0; j < n2; j++) R.push(heights[mid + 1 + j]);

            // Initialize merge pointers
            let i = 0, j = 0, k = start;

            // Prepare indices and colors for bars during merging
            let barsIndices = [];
            let barsColors = [];
            for (let i1 = start; i1 <= end; i1++) {
                barsIndices.push(i1);
                barsColors.push('yellow');
            }

            // Merge elements from temporary arrays L and R back into main array
            while (i < n1 || j < n2) {
                if (isStopped) {
                    draw([], []);
                    return;
                }
                if (!isPaused) {
                    // Choose the smaller element from L or R to merge into main array
                    if (j == n2 || (i < n1 && L[i] <= R[j])) {
                        draw([k, ...barsIndices], ['green', ...barsColors]);
                        i++;
                    } else {
                        // Shift elements in the main array for merging
                        for (let i1 = mid + 1 + j; i1 > k; i1--) {
                            swap(i1, i1 - 1);
                        }
                        draw([k, ...barsIndices], ['green', ...barsColors]);
                        j++;
                    }
                    k++;
                }
                await sleep(delay);
            }
        }
    }

    // Final actions upon Tim Sort completion
    logAction("Tim sort completed");
    draw([], []);
    isSorted = true;
    isStopped = true;
    isPaused = false;
    SortedAnimation();
}

// Update displayed number of bars on slider input and generate a new random array
barSlider.oninput = () => {
    document.querySelector('.sliderValue').innerHTML = `Bars: ${barSlider.value}`;
    generateRandomArray();
};

// Update sorting speed delay on speed slider input
speedSlider.oninput = () => {
    delay = 375 - speedSlider.value;
};

// Log actions and update the log display
function logAction(message) {
    const log = document.getElementById('log');
    log.value += message + '\n';
    log.scrollTop = log.scrollHeight;
}

// Event listener for generating a new random array on "Generate" button click
document.getElementById('generateButton').addEventListener('click', generateRandomArray);

// Event listener for starting the sorting process based on the selected sort type
document.getElementById('sortButton').addEventListener('click', () => {
    type = document.getElementById('sort_type').value;

    // Prevent sorting if already in progress
    if (!isStopped) return;

    // Generate a new array if previous one was sorted or not generated
    if (isSorted || !isGenerated) generateRandomArray();

    // Reset flags for sorting
    isGenerated = false;
    isPaused = false;
    isStopped = false;

    // Start the selected sorting algorithm
    if (type == 'bubble') {
        logAction("Starting Bubble Sort");
        bubbleSort();
    } else if (type == 'selection') {
        logAction("Starting Selection Sort");
        selectionSort();
    } else if (type == 'insertion') {
        logAction("Starting Insertion Sort");
        insertionSort();
    } else if (type == 'merge') {
        logAction("Starting Merge Sort");
        mergeSort();
    } else if (type == 'quick') {
        logAction("Starting Quick Sort");
        quickSort();
    } else if (type == 'tim') {
        logAction("Starting Tim Sort");
        timSort();
    }
});

// Event listener for stopping the sorting process on "Stop" button click
document.getElementById('stopButton').addEventListener('click', () => {
    isStopped = true; // Set stop flag
    isPaused = false; // Reset pause flag
    document.getElementById('pauseButton').innerHTML = 'Pause';

    // Log stop action and regenerate array if not yet generated or sorted
    if (!isGenerated && !isSorted) {
        logAction('Stopped!!!');
        generateRandomArray();
    }
});

// Event listener for pausing or resuming the sorting process on "Pause/Resume" button click
document.getElementById('pauseButton').addEventListener('click', () => {
    if (!isStopped) { // Only allow pause/resume if not stopped
        if (isPaused) {
            logAction('Resumed'); // Log resume action
            document.getElementById('pauseButton').innerHTML = 'Pause';
            isPaused = false; // Clear pause flag
        } else {
            logAction('Paused'); // Log pause action
            document.getElementById('pauseButton').innerHTML = 'Resume';
            isPaused = true; // Set pause flag
        }
    }
});
