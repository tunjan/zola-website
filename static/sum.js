
const CHART_BORDER_COLOR = 'rgb(51, 65, 85)';
const CHART_ANIMATION_DURATION = 800;
const PARTIAL_SUM_LABEL = 'Partial Sum';
const DEFAULT_DECIMAL_PLACES_TABLE = 6;
const DEFAULT_DECIMAL_PLACES_DISPLAY = 6;
const CONVERGENCE_THRESHOLD = 0.0001; 


const UI = {
    formulaInput: document.getElementById('function'),
    startInput: document.getElementById('start'),
    endInput: document.getElementById('end'),
    calculateButton: document.getElementById('calculate'),
    formulaDisplay: document.getElementById('formula'),
    partialSumDisplay: document.getElementById('partial-sum'),
    sequenceTermsTableBody: document.getElementById('sequence-terms-body'),
    sequenceTermsTable: document.getElementById('sequence-terms-table'),
    showTermsButton: document.getElementById('show-terms'),
    get chartCanvasContext() { 
        const canvas = document.getElementById('seriesChart');
        return canvas ? canvas.getContext('2d') : null;
    },

    
    maxTermDisplay: document.getElementById('max-term'),
    minTermDisplay: document.getElementById('min-term'),
    averageTermDisplay: document.getElementById('average-term'),
    monotonicityDisplay: document.getElementById('monotonicity'),
    maxPartialSumDisplay: document.getElementById('max-partial-sum'),
    minPartialSumDisplay: document.getElementById('min-partial-sum'),
    convergenceTrendDisplay: document.getElementById('convergence-trend'),
};


let chartInstance; 
let currentCalculationResults = {
    terms: [],
    partialSums: [],
    formula: '',
    start: NaN,
    end: NaN,
    isValid: false, 
};


const chartConfig = {
    type: 'line',
    data: {
        labels: [],
        datasets: [{
            label: PARTIAL_SUM_LABEL,
            data: [],
            borderColor: CHART_BORDER_COLOR,
            borderWidth: 2,
            tension: 0.1, 
            pointRadius: 3,
            pointBackgroundColor: CHART_BORDER_COLOR,
            pointHoverRadius: 5,
            fill: false, 
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
                    display: true,
                    text: 'Partial Sum Value'
                }
            },
            x: {
                grid: {
                    color: 'rgba(0, 0, 0, 0.05)',
                },
                title: {
                    display: true,
                    text: 'n (Term Index)'
                }
            }
        },
        plugins: {
            legend: {
                display: true, 
                position: 'top',
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
    if (!UI.chartCanvasContext) {
        console.error("Chart canvas context not found. Chart cannot be initialized.");
        return;
    }
    if (chartInstance) {
        chartInstance.destroy(); 
    }
    chartInstance = new Chart(UI.chartCanvasContext, chartConfig);
}

/**
 * Safely parses user input for formula, start, and end values.
 * @returns {{formulaString: string, start: number, end: number, rawStart: string, rawEnd: string}}
 */
function getNumericInputs() {
    const formulaString = UI.formulaInput.value.trim();
    const rawStart = UI.startInput.value;
    const rawEnd = UI.endInput.value;
    const start = parseInt(rawStart, 10);
    const end = parseInt(rawEnd, 10);
    return { formulaString, start, end, rawStart, rawEnd };
}

/**
 * Converts a user-input formula string to LaTeX format using math.js.
 * @param {string} formula - The user-input formula string.
 * @returns {string} - The LaTeX formatted string.
 */
function convertToLatex(formula) {
    if (!formula) return '';
    try {
        const node = math.parse(formula);
        return node.toTex();
    } catch (error) {
        console.warn("Error parsing formula for LaTeX conversion:", error.message);
        
        return `\\text{Invalid formula: } ${formula.replace(/[{}]/g, '').replace(/\\/g, '\\textbackslash ')}`;
    }
}

/**
 * Displays the mathematical formula using MathJax.
 * @param {string} formulaString - The formula string.
 * @param {number|string} start - The starting value of n (can be a placeholder string).
 * @param {number|string} end - The ending value of n (can be a placeholder string).
 */
async function displayFormula(formulaString, start, end) {
    if (!UI.formulaDisplay) return;
    const latexFormula = convertToLatex(formulaString);
    const displayStart = Number.isFinite(start) ? start : (start || 'n_0');
    const displayEnd = Number.isFinite(end) ? end : (end || 'N');

    UI.formulaDisplay.innerHTML = `$\\sum\\limits_{n=${displayStart}}^{${displayEnd}} ${latexFormula}$`;

    if (window.MathJax && MathJax.typesetPromise) {
        try {
            await MathJax.typesetPromise([UI.formulaDisplay]);
        } catch (err) {
            console.error("MathJax typesetting error:", err);
        }
    } else {
        console.warn("MathJax not available for typesetting.");
    }
}

/**
 * Validates the input values.
 * @param {string} formulaString - The formula string from input.
 * @param {number} start - The starting value of n.
 * @param {number} end - The ending value of n.
 * @returns {string|null} - An error message if validation fails, null otherwise.
 */
function validateInputs(formulaString, start, end) {
    if (!formulaString) {
        return "Please enter a formula for a_n.";
    }
    if (isNaN(start) || isNaN(end)) {
        return "Please enter valid numbers for the starting and ending points.";
    }
    if (!Number.isInteger(start) || !Number.isInteger(end)) {
        return "Please enter integer values for the starting and ending points.";
    }
    if (start < 0 || end < 0) { 
        return "Please enter non-negative integers for starting and ending points.";
    }
    if (start > end) {
        return "Starting point cannot be greater than the ending point.";
    }
    if (end - start > 10000) { 
        return "The range is too large (max 10,000 terms). Please choose a smaller range.";
    }
    return null;
}

/**
 * Evaluates the mathematical function for a given value of n using math.js.
 * @param {number} n - The value of n.
 * @param {string} formulaString - The formula string.
 * @returns {number} - The result of the function evaluation.
 * @throws {Error} - If the function is invalid or evaluation fails.
 */
function evaluateFunction(n, formulaString) {
    try {
        
        
        const compiledFormula = math.compile(formulaString);
        return compiledFormula.evaluate({ n });
    } catch (error) {
        console.error(`Function evaluation error for n = ${n} with formula "${formulaString}":`, error);
        throw new Error(`Invalid function at n = ${n}: ${error.message.split('\n')[0]}. Check console for details.`);
    }
}

/**
 * Calculates the partial sums and sequence terms.
 * @param {string} formulaString - The formula string.
 * @param {number} start - The starting value of n.
 * @param {number} end - The ending value of n.
 * @returns {{partialSums: number[], sequenceTerms: number[]}}
 * @throws {Error} - If evaluation fails or results in NaN/Infinity.
 */
function calculateSeriesData(formulaString, start, end) {
    let currentPartialSum = 0;
    const partialSums = [];
    const sequenceTerms = [];

    for (let n = start; n <= end; n++) {
        const term = evaluateFunction(n, formulaString);
        if (!Number.isFinite(term)) { 
            throw new Error(`Term at n = ${n} evaluated to a non-finite number (${term}).`);
        }
        sequenceTerms.push(term);
        currentPartialSum += term;
        partialSums.push(currentPartialSum);
    }
    return { partialSums, sequenceTerms };
}



/**
 * Resets all analysis display elements to empty.
 */
function resetAnalysisDisplays() {
    const displays = [
        UI.partialSumDisplay, UI.maxTermDisplay, UI.minTermDisplay,
        UI.averageTermDisplay, UI.monotonicityDisplay, UI.maxPartialSumDisplay,
        UI.minPartialSumDisplay, UI.convergenceTrendDisplay
    ];
    displays.forEach(el => { if (el) el.textContent = ''; });
    if (UI.sequenceTermsTableBody) UI.sequenceTermsTableBody.innerHTML = '';
    if (UI.sequenceTermsTable) UI.sequenceTermsTable.classList.add('hidden');

    
    if (chartInstance) {
        chartInstance.data.labels = [];
        chartInstance.data.datasets[0].data = [];
        chartInstance.options.scales.y.min = undefined; 
        chartInstance.options.scales.y.max = undefined;
        chartInstance.update('none'); 
    }
}

/**
 * Displays a loading message and resets UI.
 */
function displayLoadingState() {
    resetAnalysisDisplays();
    if (UI.partialSumDisplay) {
        UI.partialSumDisplay.innerHTML = '<i class="italic text-stone-500 dark:text-stone-400">Calculating...</i>';
    }
}

/**
 * Displays an error message in a designated area.
 * @param {string} message - The error message.
 */
function displayErrorState(message) {
    resetAnalysisDisplays(); 
    if (UI.partialSumDisplay) { 
        UI.partialSumDisplay.innerHTML = `<span class="text-red-600 dark:text-red-400 font-semibold">${message}</span>`;
    }
    currentCalculationResults.isValid = false; 
}

/**
 * Updates the sequence terms table in the DOM.
 * @param {number[]} terms - The array of sequence terms.
 * @param {number} startValue - The starting 'n' value for the terms.
 */
function updateSequenceTermsTable(terms, startValue) {
    if (!UI.sequenceTermsTableBody || !UI.sequenceTermsTable) return;

    UI.sequenceTermsTableBody.innerHTML = ''; 
    const fragment = document.createDocumentFragment();

    if (terms.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 2;
        cell.textContent = "No terms to display.";
        cell.className = 'px-6 py-4 text-center text-stone-500 dark:text-stone-400';
        row.appendChild(cell);
        fragment.appendChild(row);
    } else {
        terms.forEach((term, index) => {
            const row = document.createElement('tr');
            const nCell = document.createElement('td');
            const termCell = document.createElement('td');

            nCell.textContent = startValue + index;
            termCell.textContent = term.toFixed(DEFAULT_DECIMAL_PLACES_TABLE);

            nCell.className = 'px-6 py-4 whitespace-nowrap bg-stone-50 text-stone-500 dark:text-stone-300 dark:bg-stone-900';
            termCell.className = 'px-6 py-4 whitespace-nowrap text-stone-800 dark:text-stone-200 dark:bg-stone-800';
            row.className = 'border border-stone-400 dark:border-stone-700';

            row.appendChild(nCell);
            row.appendChild(termCell);
            fragment.appendChild(row);
        });
    }
    UI.sequenceTermsTableBody.appendChild(fragment);
    UI.sequenceTermsTable.classList.remove('hidden');
}

/**
 * Displays the final sum and other calculated results.
 * @param {number} finalSum - The final partial sum.
 */
function displayMainResults(finalSum) {
    if (UI.partialSumDisplay) {
        UI.partialSumDisplay.textContent = Number.isFinite(finalSum) ?
            finalSum.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY) : "Invalid sum (Non-finite)";
    }
}

/**
 * Displays analysis of the series (max/min term, monotonicity, etc.).
 * @param {number[]} sequenceTerms - Array of sequence terms.
 * @param {number[]} partialSums - Array of partial sums.
 */
function displaySeriesAnalysis(sequenceTerms, partialSums) {
    if (sequenceTerms.length === 0) return; 

    const maxTerm = Math.max(...sequenceTerms);
    const minTerm = Math.min(...sequenceTerms);
    const averageTerm = sequenceTerms.reduce((sum, term) => sum + term, 0) / sequenceTerms.length;
    const maxPartialSum = Math.max(...partialSums);
    const minPartialSum = Math.min(...partialSums);

    let isStrictlyIncreasing = true;
    let isStrictlyDecreasing = true;
    let isNonDecreasing = true;
    let isNonIncreasing = true;

    for (let i = 1; i < sequenceTerms.length; i++) {
        if (sequenceTerms[i] <= sequenceTerms[i - 1]) isStrictlyIncreasing = false;
        if (sequenceTerms[i] < sequenceTerms[i - 1]) isNonDecreasing = false;
        if (sequenceTerms[i] >= sequenceTerms[i - 1]) isStrictlyDecreasing = false;
        if (sequenceTerms[i] > sequenceTerms[i - 1]) isNonIncreasing = false;
    }

    let monotonicity = "Not monotonic";
    if (sequenceTerms.length === 1) monotonicity = "Single term (monotonic)";
    else if (isStrictlyIncreasing) monotonicity = "Strictly Increasing";
    else if (isStrictlyDecreasing) monotonicity = "Strictly Decreasing";
    else if (isNonDecreasing) monotonicity = "Non-decreasing";
    else if (isNonIncreasing) monotonicity = "Non-increasing";


    let convergenceTrend = "Trend unclear with this range.";
    if (partialSums.length > 2) {
        const lastDiff = Math.abs(partialSums[partialSums.length - 1] - partialSums[partialSums.length - 2]);
        const secondLastDiff = Math.abs(partialSums[partialSums.length - 2] - partialSums[partialSums.length - 3] || lastDiff); 
        if (lastDiff < CONVERGENCE_THRESHOLD) {
            convergenceTrend = "Suggests convergence (small change in partial sums).";
            if (lastDiff < secondLastDiff / 2 && lastDiff !== 0) { 
                 convergenceTrend = "Strongly suggests convergence (rapidly diminishing change).";
            }
        } else if (lastDiff > secondLastDiff * 1.5 && lastDiff > 0.1) { 
            convergenceTrend = "Suggests divergence (increasing change in partial sums).";
        }
    } else if (partialSums.length > 0 && partialSums.length <=2) {
        convergenceTrend = "Too few terms for trend analysis.";
    }

    if (UI.maxTermDisplay) UI.maxTermDisplay.textContent = maxTerm.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    if (UI.minTermDisplay) UI.minTermDisplay.textContent = minTerm.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    if (UI.averageTermDisplay) UI.averageTermDisplay.textContent = averageTerm.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    if (UI.monotonicityDisplay) UI.monotonicityDisplay.textContent = monotonicity;
    if (UI.maxPartialSumDisplay) UI.maxPartialSumDisplay.textContent = maxPartialSum.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    if (UI.minPartialSumDisplay) UI.minPartialSumDisplay.textContent = minPartialSum.toFixed(DEFAULT_DECIMAL_PLACES_DISPLAY);
    if (UI.convergenceTrendDisplay) UI.convergenceTrendDisplay.textContent = convergenceTrend;
}

/**
 * Updates the Chart.js chart with new data.
 * @param {number} startValue - The starting 'n' value for the x-axis.
 * @param {number[]} partialSumsData - The array of partial sums.
 */
function updateChart(startValue, partialSumsData) {
    if (!chartInstance) {
        console.warn("Chart not initialized, cannot update.");
        initializeChart(); 
        if(!chartInstance) return;
    }

    const labels = partialSumsData.map((_, index) => startValue + index);
    
    chartInstance.data.labels = labels;
    chartInstance.data.datasets[0].data = partialSumsData;

    
    if (partialSumsData.length > 0) {
        const minValue = Math.min(...partialSumsData);
        const maxValue = Math.max(...partialSumsData);
        const range = maxValue - minValue;
        
        const padding = range === 0 ? 1 : range * 0.1; 
        chartInstance.options.scales.y.min = minValue - padding;
        chartInstance.options.scales.y.max = maxValue + padding;
    } else {
        chartInstance.options.scales.y.min = undefined;
        chartInstance.options.scales.y.max = undefined;
    }

    try {
        chartInstance.update(); 
    } catch (error) {
        console.error("Chart.js update error:", error);
        displayErrorState("Error updating chart. Check console.");
    }
}



/**
 * Main calculation logic triggered by the "Calculate" button.
 */
async function handleCalculation() {
    const { formulaString, start, end, rawStart, rawEnd } = getNumericInputs();

    
    
    await displayFormula(formulaString, rawStart, rawEnd);

    displayLoadingState(); 

    const validationError = validateInputs(formulaString, start, end);
    if (validationError) {
        displayErrorState(validationError);
        currentCalculationResults.isValid = false;
        return;
    }

    try {
        const { partialSums, sequenceTerms } = calculateSeriesData(formulaString, start, end);

        currentCalculationResults = {
            terms: sequenceTerms,
            partialSums: partialSums,
            formula: formulaString,
            start: start,
            end: end,
            isValid: true,
        };

        displayMainResults(partialSums.length > 0 ? partialSums[partialSums.length - 1] : 0);
        updateChart(start, partialSums);
        displaySeriesAnalysis(sequenceTerms, partialSums);
        
        if (UI.sequenceTermsTable) UI.sequenceTermsTable.classList.add('hidden');


    } catch (error) {
        console.error("Calculation or Display error:", error);
        displayErrorState(error.message || "An unknown error occurred during calculation.");
        currentCalculationResults.isValid = false;
    }
}

/**
 * Handles showing/hiding the sequence terms table.
 */
function handleShowTerms() {
    if (!UI.sequenceTermsTable || !UI.sequenceTermsTableBody) return;

    if (!UI.sequenceTermsTable.classList.contains('hidden')) {
        UI.sequenceTermsTable.classList.add('hidden'); 
        if (UI.showTermsButton) UI.showTermsButton.textContent = 'Show Terms';
        return;
    }
    
    if (UI.showTermsButton) UI.showTermsButton.textContent = 'Hide Terms';

    const { formulaString, start, end } = getNumericInputs();

    
    if (currentCalculationResults.isValid &&
        currentCalculationResults.formula === formulaString &&
        currentCalculationResults.start === start &&
        currentCalculationResults.end === end &&
        currentCalculationResults.terms.length > 0)
    {
        updateSequenceTermsTable(currentCalculationResults.terms, currentCalculationResults.start);
    } else {
        
        const validationError = validateInputs(formulaString, start, end);
        if (validationError) {
            
            
            console.warn("Validation error for showing terms:", validationError);
            updateSequenceTermsTable([], start); 
            UI.sequenceTermsTableBody.firstElementChild.firstElementChild.textContent = validationError;
            if (UI.showTermsButton) UI.showTermsButton.textContent = 'Show Terms'; 
            return;
        }

        try {
            
            const { sequenceTerms } = calculateSeriesData(formulaString, start, end);
            
            currentCalculationResults.terms = sequenceTerms;
            
            
            updateSequenceTermsTable(sequenceTerms, start);
        } catch (error) {
            console.error("Error calculating/displaying sequence terms:", error);
            updateSequenceTermsTable([], start);
            UI.sequenceTermsTableBody.firstElementChild.firstElementChild.textContent = error.message || "Error fetching terms.";
            if (UI.showTermsButton) UI.showTermsButton.textContent = 'Show Terms'; 
        }
    }
}



/**
 * Sets up event listeners and initial state.
 */
function initializeApp() {
    if (!UI.calculateButton || !UI.showTermsButton || !UI.formulaInput || !UI.startInput || !UI.endInput) {
        console.error("One or more essential UI elements are missing. Application may not function correctly.");
        
        const body = document.querySelector('body');
        if (body) {
            const errorDiv = document.createElement('div');
            errorDiv.textContent = "Critical Error: UI elements missing. Please check the HTML structure or contact support.";
            errorDiv.style.color = 'red';
            errorDiv.style.padding = '20px';
            errorDiv.style.backgroundColor = 'white';
            errorDiv.style.border = '2px solid red';
            errorDiv.style.position = 'fixed';
            errorDiv.style.top = '10px';
            errorDiv.style.left = '10px';
            errorDiv.style.zIndex = '9999';
            body.prepend(errorDiv);
        }
        return; 
    }

    UI.calculateButton.addEventListener('click', handleCalculation);
    UI.showTermsButton.addEventListener('click', handleShowTerms);

    
    let debounceTimer;
    const liveUpdateFormulaDisplay = async () => {
        const { formulaString, rawStart, rawEnd } = getNumericInputs();
        const startNum = parseInt(rawStart, 10);
        const endNum = parseInt(rawEnd, 10);
        await displayFormula(formulaString, 
            isNaN(startNum) ? rawStart : startNum, 
            isNaN(endNum) ? rawEnd : endNum
        );
    };

    [UI.formulaInput, UI.startInput, UI.endInput].forEach(input => {
        input.addEventListener('input', () => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(liveUpdateFormulaDisplay, 500); 
        });
    });
    
    initializeChart();
    
    liveUpdateFormulaDisplay(); 
    resetAnalysisDisplays(); 
}



if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp(); 
}


if (typeof math === 'undefined') {
    console.error("Math.js library is not loaded. Formula evaluation will not work.");
    
    if (UI.calculateButton) UI.calculateButton.disabled = true;
    if (UI.formulaInput) UI.formulaInput.placeholder = "Error: Math.js not loaded";
    displayErrorState("Math.js library missing. Calculations are disabled.");
}
