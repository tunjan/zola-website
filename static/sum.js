let chart;

document.getElementById('calculate').addEventListener('click', function() {
    const functionStr = document.getElementById('function').value;
    const startInput = document.getElementById('start').value;
    const endInput = document.getElementById('end').value;

    const start = parseInt(startInput);
    const end = parseInt(endInput);

    displayFormula(functionStr, start, end);
    clearError();

    const validationError = validateInputs(start, end);
    if (validationError) {
        displayError(validationError);
        return;
    }

    displayLoading();

    setTimeout(() => {
        try {
            const { partialSums, sequenceTerms } = calculatePartialSums(functionStr, start, end);
            displayResults(partialSums[partialSums.length - 1], sequenceTerms, start); // Pass start value
            animateChart(start, partialSums);
        } catch (error) {
            console.error("Calculation error:", error);
            displayError(error.message || "An error occurred during calculation.");
        } finally {
            hideLoading();
        }
    }, 0);
});

function displayFormula(funcStr, start, end) {
    const formulaDiv = document.getElementById('formula');
    formulaDiv.innerHTML = `$\\sum_{n=${start}}^{${end}} ${funcStr.replace('n', 'n')}$`;
    MathJax.typesetPromise([formulaDiv]);
}

function validateInputs(start, end) {
    if (isNaN(start) || isNaN(end)) {
        return "Please enter valid numbers for the starting and ending points.";
    }
    if (start > end) {
        return "Starting point cannot be greater than the ending point.";
    }
    return null;
}

function evaluateFunction(n, funcStr) {
    try {
        const scope = { n: n };
        return math.evaluate(funcStr, scope);
    } catch (error) {
        console.error("Function evaluation error:", error);
        throw new Error("Invalid function. Please check your input.");
    }
}

function calculatePartialSums(functionStr, start, end) {
    let partialSum = 0;
    let partialSums = [];
    let sequenceTerms = [];

    for (let n = start; n <= end; n++) {
        const term = evaluateFunction(n, functionStr);
        if (isNaN(term)) {
            throw new Error("Function did not evaluate to a number for n = " + n + ".");
        }
        partialSum += term;
        partialSums.push(partialSum);
        sequenceTerms.push(term);
    }
    return { partialSums, sequenceTerms };
}

function displayResults(sum, terms, start) { // Added start parameter
    const partialSumElement = document.getElementById('partial-sum');
    partialSumElement.innerHTML = `$\\approx ${sum.toFixed(10)}$`;
    MathJax.typesetPromise([partialSumElement]);

    const termsList = document.getElementById('sequence-terms');
    termsList.innerHTML = "";

    terms.forEach((term, index) => { // Added index
        const termNumber = start + index; // Calculate the term number (a_1, a_2, etc.)
        const listItem = document.createElement('li');
        listItem.innerHTML = `$a_{${termNumber}} \\approx ${term.toFixed(10)}$`; // Display term with subscript
        listItem.classList.add('text-gray-700', 'font-medium', 'mb-1', 'dark:text-gray-300');
        termsList.appendChild(listItem);
        MathJax.typesetPromise([listItem]);
    });
}

function displayError(message) {
    const errorElement = document.createElement('li');
    errorElement.textContent = message;
    errorElement.classList.add('text-red-500', 'font-medium');
    document.getElementById('sequence-terms').innerHTML = "";
    document.getElementById('sequence-terms').appendChild(errorElement);
    document.getElementById('partial-sum').textContent = "";
    destroyChart();
}

function clearError() {
    document.getElementById('sequence-terms').innerHTML = "";
    destroyChart();
}

function displayLoading() {
    document.getElementById('partial-sum').innerHTML = `<i class="italic text-gray-500">Calculating...</i>`;
    document.getElementById('sequence-terms').innerHTML = "";
    destroyChart();
}

function hideLoading() {}

function animateChart(startValue, partialSums) {
    const ctx = document.getElementById('seriesChart').getContext('2d');
    const labels = partialSums.map((_, index) => startValue + index);

    if (chart) {
        chart.destroy();
    }

    // Calculate min and max values for centering the y-axis
    const minValue = Math.min(...partialSums);
    const maxValue = Math.max(...partialSums);
    const padding = (maxValue - minValue) * 0.1; // 10% padding

    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Partial Sum',
                data: partialSums,
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
                    // Do not begin at zero
                    beginAtZero: false,
                    // Set min and max with padding
                    min: minValue - padding,
                    max: maxValue + padding,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)',
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
    });
}

function destroyChart() {
    if (chart) {
        chart.destroy();
        chart = null;
    }
}