// Constants for DOM elements
const formulaInput = document.getElementById('function');
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const calculateButton = document.getElementById('calculate');
const formulaDisplay = document.getElementById('formula');
const partialSumDisplay = document.getElementById('partial-sum');
const sequenceTermsTable = document.getElementById('sequence-terms');
const chartCanvas = document.getElementById('seriesChart').getContext('2d');

let chart; // Global chart object

// Chart configuration object for better readability and maintainability
const chartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: 'Partial Sum',
            data: [],
            borderColor: 'rgb(51, 65, 85)',
            borderWidth: 2,
            tension: 0.4,
            pointRadius: 3,
            pointBackgroundColor: 'rgb(51, 65, 85)',
            pointHoverRadius: 5
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 800,
            easing: 'easeInOutQuad',
        },
        scales: {
            y: {
                beginAtZero: false,
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                title: {
                    display: false,
                    text: 'Partial Sum Value'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                title: {
                    display: true,
                    text: 'n'
                }
            }
        },
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                mode: 'index',
                intersect: false,
            }
        }
    }
};

/**
 * Initializes the Chart.js chart.
 */
function initializeChart() {
    chart = new Chart(chartCanvas, chartConfig);
}

/**
 * Displays the mathematical formula using MathJax.
 * @param {string} formulaString - The formula string.
 * @param {number} start - The starting value of n.
 * @param {number} end - The ending value of n.
 */
function displayFormula(formulaString, start, end) {
    formulaDisplay.innerHTML = `$\\sum\\limits_{n=${start}}^{${end}} ${formulaString}$`;
    // Use a separate microtask queue to ensure MathJax processing after DOM updates
    queueMicrotask(() => {
        MathJax.typesetPromise([formulaDisplay])
            .catch((err) => console.error("MathJax typesetting error:", err));
    });
}

/**
 * Validates the input values.
 * @param {number} start - The starting value of n.
 * @param {number} end - The ending value of n.
 * @returns {string|null} - An error message if validation fails, null otherwise.
 */
function validateInputs(start, end) {
    if (isNaN(start) || isNaN(end)) {
        return "Please enter valid numbers for the starting and ending points.";
    }
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return "Please enter integer values for the starting and ending points.";
    }
    if (start < 0 || end < 0) {
        return "Please enter non-negative numbers for the starting and ending points.";
    }
    if (start > end) {
        return "Starting point cannot be greater than the ending point.";
    }
    return null;
}

/**
 * Evaluates the mathematical function for a given value of n.
 * @param {number} n - The value of n.
 * @param {string} formulaString - The formula string.
 * @returns {number} - The result of the function evaluation.
 * @throws {Error} - If the function is invalid.
 */
function evaluateFunction(n, formulaString) {
    try {
        const scope = { n };
        return math.evaluate(formulaString, scope);
    } catch (error) {
        console.error(`Function evaluation error for n = ${n}:`, error);
        throw new Error(`Invalid function at n = ${n}. Please check your input.`);
    }
}

/**
 * Calculates the partial sums of the series.
 * @param {string} formulaString - The formula string.
 * @param {number} start - The starting value of n.
 * @param {number} end - The ending value of n.
 * @returns {{partialSums: number[], sequenceTerms: number[]}} - An object containing the partial sums and sequence terms.
 * @throws {Error} - If the function evaluation results in NaN.
 */
function calculatePartialSums(formulaString, start, end) {
    let partialSum = 0;
    const partialSums = [];
    const sequenceTerms = [];

    for (let n = start; n <= end; n++) {
        const term = evaluateFunction(n, formulaString);
        if (isNaN(term)) {
            throw new Error(`Function did not evaluate to a number for n = ${n}.`);
        }
        partialSum += term;
        partialSums.push(partialSum);
        sequenceTerms.push(term);
    }

    return { partialSums, sequenceTerms };
}

/**
 * Displays the results of the calculation.
 * @param {number} sum - The final partial sum.
 * @param {number[]} terms - The sequence terms.
 * @param {number} decimalPlaces - The number of decimal places to display.
 */
function displayResults(sum, terms, decimalPlaces = 18) { // Increased decimal places to 18
    partialSumDisplay.textContent = sum.toFixed(decimalPlaces);
    updateSequenceTermsTable(terms, decimalPlaces);
}

/**
 * Displays an error message.
 * @param {string} message - The error message.
 */
function displayError(message) {
    const errorElement = document.createElement('li');
    errorElement.textContent = message;
    errorElement.classList.add('text-red-500', 'font-medium');
    sequenceTermsTable.innerHTML = ''; // Clear table
    sequenceTermsTable.appendChild(errorElement);
    partialSumDisplay.textContent = ''; // Clear partial sum
}

/**
 * Clears the error message.
 */
function clearError() {
    sequenceTermsTable.innerHTML = ''; // Clear table
}

/**
 * Displays a loading message.
 */
function displayLoading() {
    partialSumDisplay.innerHTML = `<i class="italic text-gray-500">Calculating...</i>`;
    sequenceTermsTable.innerHTML = '';
}

/**
 * Updates the Chart.js chart with new data.
 * @param {number} startValue - The starting value of n.
 * @param {number[]} partialSums - The partial sums.
 */
function updateChart(startValue, partialSums) {
    const labels = partialSums.map((_, index) => startValue + index);

    // Calculate min and max values for centering the y-axis
    const minValue = Math.min(...partialSums);
    const maxValue = Math.max(...partialSums);
    const padding = (maxValue - minValue) * 0.1; // 10% padding

    // Update chart data and options
    chart.data.labels = labels;
    chart.data.datasets[0].data = partialSums;
    chart.options.scales.y.min = minValue - padding;
    chart.options.scales.y.max = maxValue + padding;

    try {
        chart.update(); // Efficiently update the chart
    } catch (error) {
        console.error("Chart.js update error:", error);
        displayError("An error occurred while updating the chart.");
    }
}

/**
 * Updates the table with the sequence terms.
 * @param {number[]} terms - The sequence terms.
 * @param {number} decimalPlaces - The number of decimal places to display.
 */
function updateSequenceTermsTable(terms, decimalPlaces = 12) { // Increased default to 12
    sequenceTermsTable.innerHTML = '';
    for (let i = 0; i < terms.length; i++) {
        const row = document.createElement('tr');
        const nCell = document.createElement('td');
        const termCell = document.createElement('td');

        nCell.textContent = parseInt(i) + parseInt(startInput.value); // Use the correct 'n' value
        termCell.textContent = terms[i].toFixed(decimalPlaces); // Display to specified decimal places

        nCell.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'bg-gray-50', 'text-gray-500', 'dark:text-gray-300');
        termCell.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'text-gray-800', 'dark:text-gray-200');
        row.classList.add('border', 'border-gray-200');

        row.appendChild(nCell);
        row.appendChild(termCell);
        sequenceTermsTable.appendChild(row);
    }
}

// Event Listener and Main Logic
calculateButton.addEventListener('click', async () => {
    const formulaString = formulaInput.value;
    const start = parseInt(startInput.value);
    const end = parseInt(endInput.value);

    displayFormula(formulaString, start, end);
    clearError();

    const validationError = validateInputs(start, end);
    if (validationError) {
        displayError(validationError);
        return;
    }

    displayLoading();

    try {
        // Perform calculations synchronously since they are not inherently asynchronous in this context
        const { partialSums, sequenceTerms } = calculatePartialSums(formulaString, start, end);
        displayResults(partialSums[partialSums.length - 1], sequenceTerms);
        updateChart(start, partialSums);
    } catch (error) {
        console.error("Calculation error:", error);
        displayError(error.message || "An error occurred during calculation.");
    }
});

// Initialize the chart on page load
initializeChart();