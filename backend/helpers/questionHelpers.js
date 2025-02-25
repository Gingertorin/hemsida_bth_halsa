/**
 * Generates random values based on the provided variating_values JSON.
 * Supports range-based values, step-based values, fixed lists, and conditions.
 * @param {string} variatingValuesJson - JSON string containing variable constraints.
 * @returns {Object} - An object mapping variable names to randomly generated values.
 */
const generateValues = (variatingValuesJson) => {
    try {
        const variables = JSON.parse(variatingValuesJson);
        let generatedValues = {};

        for (const [key, rule] of Object.entries(variables)) {
            if (Array.isArray(rule)) {
                if (rule.length === 2) {
                    // Range-based values [min, max]
                    const [min, max] = rule;
                    generatedValues[key] = Math.floor(Math.random() * (max - min + 1)) + min;
                } else if (rule.length === 3) {
                    // Step-based values [min, max, step]
                    const [min, max, step] = rule;
                    const steps = Math.floor((max - min) / step) + 1;
                    generatedValues[key] = min + step * Math.floor(Math.random() * steps);
                } else {
                    // Fixed list selection
                    generatedValues[key] = getRandomElement(rule);
                }
            } else if (typeof rule === "string" && rule.includes("?")) {
                // Conditional variable assignment
                const [conditionVar, options] = rule.split("?");
                const optionLists = options.split(",").map(opt => JSON.parse(opt.trim()));
                const selectedIndex = Object.keys(variables).indexOf(conditionVar.trim());
                generatedValues[key] = getRandomElement(optionLists[selectedIndex] || []);
            }
        }

        // Apply conditions
        if (variables.condition) {
            const [var1, operator, var2] = variables.condition.split(" ");
            const value1 = generatedValues[var1];
            const value2 = generatedValues[var2];

            if (operator === ">" && value1 <= value2) {
                generatedValues[var1] = value2 + 1;
            } else if (operator === "<" && value1 >= value2) {
                generatedValues[var1] = value2 - 1;
            }
        }
        return generatedValues;
    } catch (error) {
        return {};
    }
};

/**
 * Evaluates a formula using generated values.
 * @param {string} formula - The formula as a string.
 * @param {Object} values - An object containing variable-value mappings.
 * @returns {number|string} - The computed result or an error message.
 */
const evaluateFormula = (formula, values) => {
    try {
        const expression = formula.replace(/\b[a-zA-Z]+\b/g, match => values[match] !== undefined ? values[match] : 0);
        return eval(expression);
    } catch (error) {
        return "Error in formula evaluation";
    }
};

// Export all helper functions
module.exports = {
    generateValues,
    evaluateFormula
};