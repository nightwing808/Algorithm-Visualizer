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
    return Math.random() * (max - min) + min;
}
function generateRandomArray() {
    const Log = document.getElementById('log');
    if (Log) Log.value = '';
    logAction('Random Array Generated ^_^');
    isGenerated = true;
    isSorted = false;
    isStopped = true;
    isPaused = false;
    n = barSlider.value;
    lineWidth = width / n - 1;
    container.innerHTML = '';
    for (let i = 0; i < n; i++) {
        heights[i] = parseInt(getRandomValue(1, height));
        bars.push(document.createElement('div'));
        bars[i].style.width = `${lineWidth}px`;
        bars[i].style.height = `${heights[i]}px`;
        bars[i].style.transform = `translate(${i * lineWidth + i}px)`;
        bars[i].style.backgroundColor = 'white';
        bars[i].className = 'bar';
        container.appendChild(bars[i]);

        if (n <= 50) {
            barValues.push(document.createElement('div'));
            barValues[i].innerHTML = heights[i];
            barValues[i].style.marginBottom = `${heights[i] + 5}px`;
            barValues[i].style.transform = `translate(${i * lineWidth + i}px)`;
            barValues[i].className = 'barValue';
            container.appendChild(barValues[i]);
        }
    }
}
generateRandomArray();

function swap(i, minindex) {
    [heights[i], heights[minindex]] = [heights[minindex], heights[i]];

    [bars[i], bars[minindex]] = [bars[minindex], bars[i]];
    [bars[i].style.transform, bars[minindex].style.transform] = [bars[minindex].style.transform, bars[i].style.transform];

    [barValues[i], barValues[minindex]] = [barValues[minindex], barValues[i]];
    [barValues[i].style.transform, barValues[minindex].style.transform] = [
        barValues[minindex].style.transform,
        barValues[i].style.transform,
    ];
}

function draw(coloredBars, colors) {
    for (let i = 0; i < n; i++) {
        bars[i].style.backgroundColor = 'white';
        for (let j = 0; j < coloredBars.length; j++) {
            if (i == coloredBars[j]) {
                bars[i].style.backgroundColor = colors[j];
                break;
            }
        }
    }
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
async function SortedAnimation() {
    for (let i = 0; i < n; i++) {
        bars[i].style.backgroundColor = 'lime';
        await sleep(10);
    }
    await sleep(300);
    for (let i = 0; i < n; i++) {
        bars[i].style.backgroundColor = 'white';
        await sleep(10);
    }
}

async function bubbleSort() {
    for (let i = 0; i < n - 1; i++) {
        logAction(`Iteration ${i + 1}: Starting to check elements`);
        for (let j = 0; j < n - i - 1; j++) {
            if (isStopped) {
                draw([], []);
                return;
            }
            if (!isPaused) {
                if (heights[j] > heights[j + 1]) {
                    logAction(`Swapping index ${j} and index ${j + 1}`);
                    swap(j, j + 1);
                }
                draw([j, j + 1], ['green', 'yellow']);
            } else {
                j--;
            }
            await sleep(delay);
        }
        let new_arr = [];
        for (let j = 0; j < n ; j++) {
            new_arr[j] = heights[j];
        }
        logAction(`Array after iteration ${i + 1}: [${new_arr}]`);
    }
    logAction("Bubble sort completed");
    draw([], []);
    isSorted = true;
    isStopped = true;
    isPaused = false;
    SortedAnimation();
}

async function selectionSort() {
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        logAction(`Starting iteration ${i + 1}, finding minimum from index ${i}`);
        for (let j = i + 1; j < n; j++) {
            if (isStopped) {
                draw([], []);
                return;
            }
            if (!isPaused) {
                if (heights[j] < heights[minIndex]) {
                    logAction(`New minimum found: ${heights[j]}`);
                    minIndex = j;
                }
                draw([i, j, minIndex], ['blue', 'red', 'green']);
            } else {
                j--;
            }
            await sleep(delay);
        }
        swap(i, minIndex);
        logAction(`Swapping element ${heights[i]} with new minimum ${heights[minIndex]}`);
    }
    logAction("Selection sort completed");
    draw([], []);
    isSorted = true;
    isStopped = true;
    isPaused = false;
    SortedAnimation();
}

async function insertionSort() {
    for (let i = 0; i < n; i++) {
        let key = heights[i];
        let j;
        for (j = i - 1; j >= 0 && heights[j] > key; j--) {
            if (isStopped) {
                draw([], []);
                return;
            }
            if (!isPaused) {
                swap(j, j + 1);
                draw([j, i + 1], ['green', 'red']);
            } else {
                j++;
            }
            await sleep(delay);
        }
        logAction(`${key} shifted from index ${i} to index ${j+1}`);
    }
    logAction("Insertion sort completed");
    draw([], []);
    isSorted = true;
    isStopped = true;
    isPaused = false;
    SortedAnimation();
}

async function mergeSort() {
    for (let curSize = 1; curSize < n; curSize *= 2) {
        logAction(`Current merge size: ${curSize}`);
        for (let start = 0; start < n - 1; start += 2 * curSize) {
            let mid = Math.min(start + curSize - 1, n - 1);
            let end = Math.min(start + 2 * curSize - 1, n - 1);
            let n1 = mid - start + 1;
            let n2 = end - mid;
            let L = [],R = [];
            for (let i = 0; i < n1; i++) L.push(heights[start + i]);
            for (let j = 0; j < n2; j++) R.push(heights[mid + 1 + j]);

            logAction(`Merging subarrays from ${start} to ${mid} and ${mid + 1} to ${end}`);
            let i = 0,j = 0,k = start;

            let barsIndices = [];
            let barsColors = [];
            for (let i1 = start; i1 <= end; i1++) {
                barsIndices.push(i1);
                barsColors.push('yellow');
            }

            while (i < n1 || j < n2) {
                if (isStopped) {
                    draw([], []);
                    return;
                }
                if (!isPaused) {
                    if (j == n2 || (i < n1 && L[i] <= R[j])) {
                        draw([k, ...barsIndices], ['green', ...barsColors]);
                        i++;
                    } else {
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
    logAction('Merge sort completed');
    draw([], []);
    isSorted = true;
    isStopped = true;
    isPaused = false;
    SortedAnimation();
}

async function quickSort() {
    let s = new Stack();
    s.push(0);
    s.push(n - 1);
    while (!s.isEmpty()) {
        let h = s.pop();
        let l = s.pop();

        logAction(`Popped indices: l = ${l}, h = ${h}`);
        let i = l - 1;

        let barsIndices = [];
        let barsColors = [];
        for (let i1 = l; i1 <= h; i1++) {
            barsIndices.push(i1);
            barsColors.push('yellow');
        }
        logAction(`Partitioning array between indices l = ${l} and h = ${h}`);

        for (let j = l; j <= h - 1; j++) {
            if (isStopped) {
                draw([], []);
                return;
            }
            if (!isPaused) {
                draw([i, j, ...barsIndices], ['green', 'red', ...barsColors]);
                if (heights[j] <= heights[h]) {
                    i++;
                    logAction(`Swapping elements at indices ${i} and ${j}`);
                    swap(i, j);
                }
            } else {
                j--;
            }
            await sleep(delay);
        }
        swap(i + 1, h);
        logAction(`Swapping pivot element at index ${h} with element at index ${i + 1}`);
        let partition = i + 1;
        logAction(`Partition index: ${partition}`);
        if (l < partition - 1) {
            s.push(l);
            s.push(partition - 1);
            logAction(`Pushing indices: l = ${l}, h = ${partition - 1}`);
        }
        if (partition + 1 < h) {
            s.push(partition + 1);
            s.push(h);
            logAction(`Pushing indices: l = ${partition + 1}, h = ${h}`);
        }
    }
    logAction('Quick sort completed');
    draw([], []);
    isSorted = true;
    isStopped = true;
    isPaused = false;
    SortedAnimation();
}

async function insertionSortTim(left, right) {
    for (let i = left ; i <= right; i++) {
        let key = heights[i];
        for (let j = i - 1; j >= left && heights[j] > key; j--) {
            if (isStopped) {
                draw([], []);
                return;
            }
            if (!isPaused) {
                swap(j, j + 1);
                draw([j, i + 1], ['green', 'red']);
            } else {
                j++;
            }
            await sleep(delay);
        }
    }
}

async function timSort() {
    let n = heights.length;

    for (let i = 0; i < n; i += RUN) {
        await insertionSortTim(i, Math.min(i + RUN - 1, n - 1));
        logAction(`Sorted small chunk from index ${i} to ${Math.min(i + RUN - 1, n - 1)}: [${heights.slice(i, i + RUN).join(", ")}]`);
    }

    for (let size = RUN; size < n; size = 2 * size) {
        for (let start = 0; start < n - 1; start += 2 * size) {
            let mid = Math.min(start + size - 1, n - 1);
            let end = Math.min(start + 2 * size - 1, n - 1);
            logAction(`Merging subarrays from ${start} to ${mid} and ${mid + 1} to ${end}`);

            let n1 = mid - start + 1;
            let n2 = end - mid;
            let L = [],R = [];
            for (let i = 0; i < n1; i++) L.push(heights[start + i]);
            for (let j = 0; j < n2; j++) R.push(heights[mid + 1 + j]);
            let i = 0,j = 0,k = start;

            let barsIndices = [];
            let barsColors = [];
            for (let i1 = start; i1 <= end; i1++) {
                barsIndices.push(i1);
                barsColors.push('yellow');
            }

            while (i < n1 || j < n2) {
                if (isStopped) {
                    draw([], []);
                    return;
                }
                if (!isPaused) {
                    if (j == n2 || (i < n1 && L[i] <= R[j])) {
                        draw([k, ...barsIndices], ['green', ...barsColors]);
                        i++;
                    } else {
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

    logAction("Tim sort completed");
    draw([], []);
    isSorted = true;
    isStopped = true;
    isPaused = false;
    SortedAnimation();
}

barSlider.oninput = () => {
    document.querySelector('.sliderValue').innerHTML = `Bars: ${barSlider.value}`;
    generateRandomArray();
};
speedSlider.oninput = () => {
    delay = 375 - speedSlider.value;
};

function logAction(message) {
    const log = document.getElementById('log');
    log.value += message + '\n';
    log.scrollTop = log.scrollHeight;
}

document.getElementById('generateButton').addEventListener('click', generateRandomArray);
document.getElementById('sortButton').addEventListener('click', () => {
    type = document.getElementById('sort_type').value;

    if (!isStopped) return;
    if (isSorted || !isGenerated) generateRandomArray();

    isGenerated = false;
    isPaused = false;
    isStopped = false;

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
    }else if (type == 'tim' ) {
        logAction("Starting Tim Sort");
        timSort();
    }
});
document.getElementById('stopButton').addEventListener('click', () => {
    isStopped = true;
    isPaused = false;
    document.getElementById('pauseButton').innerHTML = 'Pause';
    if (!isGenerated && !isSorted) {
        logAction('Stopped!!!');
        generateRandomArray();
    }
});

document.getElementById('pauseButton').addEventListener('click', () => {
    if (!isStopped) {
        if (isPaused) {
            logAction('Resumed');
            document.getElementById('pauseButton').innerHTML = 'Pause';
            isPaused = false;
        } else {
            logAction('Paused');
            document.getElementById('pauseButton').innerHTML = 'Resume';
            isPaused = true;
        }
    }
});