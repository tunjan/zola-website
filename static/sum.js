// Constants for DOM elements
const formulaInput = document.getElementById('function');
const startInput = document.getElementById('start');
const endInput = document.getElementById('end');
const calculateButton = document.getElementById('calculate');
const formulaDisplay = document.getElementById('formula');
const partialSumDisplay = document.getElementById('partial-sum');
const sequenceTermsTableBody = document.getElementById('sequence-terms-body');
const sequenceTermsTable = document.getElementById('sequence-terms-table');
const showTermsButton = document.getElementById('show-terms');
const chartCanvas = document.getElementById('seriesChart').getContext('2d');

// Analysis Display Elements
const maxTermDisplay = document.getElementById('max-term');
const minTermDisplay = document.getElementById('min-term');
const averageTermDisplay = document.getElementById('average-term');
const monotonicityDisplay = document.getElementById('monotonicity');
const maxPartialSumDisplay = document.getElementById('max-partial-sum');
const minPartialSumDisplay = document.getElementById('min-partial-sum');
const convergenceTrendDisplay = document.getElementById('convergence-trend');

// Other Constants
const CHART_BORDER_COLOR = 'rgb(51, 65, 85)';
const CHART_ANIMATION_DURATION = 800;
const PARTIAL_SUM_LABEL = 'Partial Sum';
const DEFAULT_DECIMAL_PLACES_TABLE = 6;
const DEFAULT_DECIMAL_PLACES_DISPLAY = 6;

let chart; // Global chart object

// Chart configuration object for better readability and maintainability
const chartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: PARTIAL_SUM_LABEL,
            data: [],
            borderColor: CHART_BORDER_COLOR,
            borderWidth: 2,
            tension: 0, // Set tension to 0 for straight lines
            pointRadius: 3,
            pointBackgroundColor: CHART_BORDER_COLOR,
            pointHoverRadius: 5
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: CHART_ANIMATION_DURATION,
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
                    display: false,
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
 * Converts a user-input formula string to LaTeX format.
 * @param {string} formula - The user-input formula string.
 * @returns {string} - The LaTeX formatted string.
 */
function convertToLatex(formula) {
    // Basic fraction conversion: a/b to \frac{a}{b}
    formula = formula.replace(/(\w+)\/(\w+)/g, '\\frac{$1}{$2}');

    // More complex fraction handling (allowing expressions in numerator/denominator)
    formula = formula.replace(/([^/\s]+)\/([^/\s]+)/g, '\\frac{$1}{$2}');

    // Square root conversion: sqrt(x) to \sqrt{x}
    formula = formula.replace(/sqrt\(([^)]+)\)/g, '\\sqrt{$1}');

    // Multiplication (optional): * to \times
    formula = formula.replace(/\*/g, '\\times');

    return formula;
}

/**
 * Displays the mathematical formula using MathJax.
 * @param {string} formulaString - The formula string.
 * @param {number} start - The starting value of n.
 * @param {number} end - The ending value of n.
 */
function displayFormula(formulaString, start, end) {
    const latexFormula = convertToLatex(formulaString);
    formulaDisplay.innerHTML = `$\\sum\\limits_{n=${start}}^{${end}} ${latexFormula}$`;
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
        const errorMessage = error.message ? `Invalid function at n = ${n}: ${error.message}` : `Invalid function at n = ${n}. Please check your input.`;
        throw new Error(errorMessage);
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
 * Updates the content of the sequence terms table.
 * @param {number[]} terms - The sequence terms.
 * @param {number} decimalPlaces - The number of decimal places to display.
 */
function updateSequenceTermsTable(terms, decimalPlaces = DEFAULT_DECIMAL_PLACES_TABLE) {
    sequenceTermsTableBody.innerHTML = '';
    const startValue = parseInt(startInput.value);
    for (let i = 0; i < terms.length; i++) {
        const row = document.createElement('tr');
        const nCell = document.createElement('td');
        const termCell = document.createElement('td');

        nCell.textContent = i + startValue;
        termCell.textContent = terms[i].toFixed(decimalPlaces);

        nCell.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'bg-gray-50', 'text-gray-500', 'dark:text-gray-300');
        termCell.classList.add('px-6', 'py-4', 'whitespace-nowrap', 'text-gray-800', 'dark:text-gray-200');
        row.classList.add('border', 'border-gray-200');

        row.appendChild(nCell);
        row.appendChild(termCell);
        sequenceTermsTableBody.appendChild(row);
    }
}

/**
 * Displays the results of the calculation.
 * @param {number} sum - The final partial sum.
 */
function displayResults(sum) {
    partialSumDisplay.textContent = sum.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
}

/**
 * Displays the analysis of the series.
 * @param {number[]} sequenceTerms - The sequence terms.
 * @param {number[]} partialSums - The partial sums.
 */
function displayAnalysis(sequenceTerms, partialSums) {
    const maxTerm = Math.max(...sequenceTerms);
    const minTerm = Math.min(...sequenceTerms);
    const averageTerm = sequenceTerms.reduce((sum, term) => sum + term, 0) / sequenceTerms.length;
    const maxPartialSum = Math.max(...partialSums);
    const minPartialSum = Math.min(...partialSums);

    let isIncreasing = true;
    let isDecreasing = true;
    for (let i = 1; i < sequenceTerms.length; i++) {
        if (sequenceTerms[i] > sequenceTerms[i - 1]) {
            isDecreasing = false;
        }
        if (sequenceTerms[i] < sequenceTerms[i - 1]) {
            isIncreasing = false;
        }
    }

    let monotonicity = 'Neither increasing nor decreasing';
    if (isIncreasing) {
        monotonicity = 'Increasing';
    } else if (isDecreasing) {
        monotonicity = 'Decreasing';
    }

    let convergenceTrend = "Cannot determine convergence with this range.";
    if (partialSums.length > 2) {
        const lastDiff = Math.abs(partialSums[partialSums.length - 1] - partialSums[partialSums.length - 2]);
        if (lastDiff < 0.001) { // Arbitrary small value for demonstration
            convergenceTrend = "Partial sums may be converging.";
        }
    }

    maxTermDisplay.textContent = maxTerm.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    minTermDisplay.textContent = minTerm.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    averageTermDisplay.textContent = averageTerm.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    monotonicityDisplay.textContent = monotonicity;
    maxPartialSumDisplay.textContent = maxPartialSum.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    minPartialSumDisplay.textContent = minPartialSum.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    convergenceTrendDisplay.textContent = convergenceTrend;
}

/**
 * Displays an error message.
 * @param {string} message - The error message.
 */
function displayError(message) {
    const errorElement = document.createElement('li');
    errorElement.textContent = message;
    errorElement.classList.add('text-red-500', 'font-medium');
    sequenceTermsTableBody.innerHTML = '';
    sequenceTermsTable.classList.add('hidden');
    partialSumDisplay.textContent = '';
    maxTermDisplay.textContent = '';
    minTermDisplay.textContent = '';
    averageTermDisplay.textContent = '';
    monotonicityDisplay.textContent = '';
    maxPartialSumDisplay.textContent = '';
    minPartialSumDisplay.textContent = '';
    convergenceTrendDisplay.textContent = '';
}

/**
 * Clears the error message.
 */
function clearError() {
    sequenceTermsTableBody.innerHTML = '';
    sequenceTermsTable.classList.add('hidden');
    maxTermDisplay.textContent = '';
    minTermDisplay.textContent = '';
    averageTermDisplay.textContent = '';
    monotonicityDisplay.textContent = '';
    maxPartialSumDisplay.textContent = '';
    minPartialSumDisplay.textContent = '';
    convergenceTrendDisplay.textContent = '';
}

/**
 * Displays a loading message.
 */
function displayLoading() {
    partialSumDisplay.innerHTML = '<i class="italic text-gray-500 dark:text-gray-400">Calculating...</i>';
    sequenceTermsTableBody.innerHTML = '';
    sequenceTermsTable.classList.add('hidden');
    maxTermDisplay.textContent = '';
    minTermDisplay.textContent = '';
    averageTermDisplay.textContent = '';
    monotonicityDisplay.textContent = '';
    maxPartialSumDisplay.textContent = '';
    minPartialSumDisplay.textContent = '';
    convergenceTrendDisplay.textContent = '';
}

/**
 * Updates the Chart.js chart with new data.
 * @param {number} startValue - The starting value of n.
 * @param {number[]} partialSums - The partial sums.
 */
function updateChart(startValue, partialSums) {
    const labels = partialSums.map((_, index) => startValue + index);
    const minValue = Math.min(...partialSums);
    const maxValue = Math.max(...partialSums);
    const padding = (maxValue - minValue) * 0.1;

    chart.data.labels = labels;
    chart.data.datasets[0].data = partialSums;
    chart.options.scales.y.min = minValue - padding;
    chart.options.scales.y.max = maxValue + padding;

    try {
        chart.update();
    } catch (error) {
        console.error("Chart.js update error:", error);
        displayError("An error occurred while updating the chart.");
    }
}

// Event Listener to show sequence terms
showTermsButton.addEventListener('click', () => {
    const formulaString = formulaInput.value;
    const start = parseInt(startInput.value);
    const end = parseInt(endInput.value);

    const validationError = validateInputs(start, end);
    if (validationError) {
        displayError(validationError);
        return;
    }

    try {
        const { sequenceTerms } = calculatePartialSums(formulaString, start, end);
        updateSequenceTermsTable(sequenceTerms);
        sequenceTermsTable.classList.remove('hidden');
    } catch (error) {
        console.error("Error calculating or displaying sequence terms:", error);
        displayError(error.message || "An error occurred while displaying sequence terms.");
    }
});

// Event Listener and Main Logic
calculateButton.addEventListener('click', async () => {
    const formulaString = formulaInput.value;
    const start = parseInt(startInput.value);
    const end = parseInt(endInput.value);

    displayFormula(formulaString, start, end);
    clearError();
    displayLoading();

    const validationError = validateInputs(start, end);
    if (validationError) {
        displayError(validationError);
        return;
    }

    try {
        const { partialSums, sequenceTerms } = calculatePartialSums(formulaString, start, end);
        displayResults(partialSums[partialSums.length - 1]);
        updateChart(start, partialSums);
        displayAnalysis(sequenceTerms, partialSums);
    } catch (error) {
        console.error("Calculation error:", error);
        displayError(error.message || "An error occurred during calculation.");
    }
});

// Initialize the chart on page load
initializeChart();