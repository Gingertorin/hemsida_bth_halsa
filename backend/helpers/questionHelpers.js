/**
 * Generates random values based on the provided variating_values JSON.
 * Supports range-based values, step-based values, fixed lists, and conditions.
 * @param {string} variatingValuesJson - JSON string containing variable constraints.
 * @returns {Object} - An object mapping variable names to randomly generated values.
 */
function generateValues(questionText, variatingValues, medicineList) {
    const generatedValues = {};

    // List of diverse names to randomly select from
    const namesList = [
        "Alice", "Bob", "Charlie", "Diana", "Elias", "Frida",
        "Gustav", "Hanna", "Isak", "Jasmine", "Kasper", "Lina",
        "Mikael", "Nora", "Oskar", "Petra", "Quentin", "Rebecca",
        "Simon", "Tove", "Ulf", "Vera", "Wilhelm", "Xenia",
        "Yasmine", "Zack"
    ];
    
    // Select medicine
    let selectedMedicine = null;
    if (Array.isArray(variatingValues.medicine) && variatingValues.medicine.length > 0) {
        const availableMedicines = medicineList.filter(med => variatingValues.medicine.includes(med.namn));
        if (availableMedicines.length > 0) {
            selectedMedicine = availableMedicines[Math.floor(Math.random() * availableMedicines.length)];
        }
    }
    
    // Load `styrkor_doser` from the selected medicine
    let medData = null;
    if (selectedMedicine){
        medData = JSON.parse(selectedMedicine.styrkor_doser || "{}")
    }

    // Extract all variable names (Strings in between %%) from `questionText`
    const variableMatches = questionText.match(/%%(.*?)%%/g) || [];
    const extractedVariables = [...new Set(variableMatches.map(v => v.replace(/%%/g, '')))];

    //NOTE:: Debug
    // console.log("Extracted Variables from Question:", extractedVariables);

    let conditionMet = false;
    let maxAttempts = 50;
    let attempts = 0;

    while (!conditionMet && attempts < maxAttempts) {
        if (attempts == 10){
            console.log(`Failed to generate values for:\n`, questionText);
            console.log(`\nAttempting to generate values...`);
        }
        attempts++;
        extractedVariables.forEach((varName) => {
            // Assign a random name from the list
            if (varName === "name" || varName === "namn") {
                generatedValues[varName] = namesList[Math.floor(Math.random() * namesList.length)];


            // Pick a value from medicine data
            } else if (medData && medData[varName]) {
                generatedValues[varName] = extractValue(medData[varName]);
            
            // Pick a value from variating data
            } else if (variatingValues[varName]) {
                    generatedValues[varName] = extractValue(variatingValues[varName]);
            } else {
                console.warn(`Warning: No data found for '${varName}'.\nFor the question:\n`, questionText);
            }
        });

        if (variatingValues.condition) {
            conditionMet = evaluateCondition(variatingValues.condition, generatedValues);

        // If no condition exist exit the loop
        } else {
            conditionMet = true;
        }

    }

    // NOTE:: Deal with the loop not completeing.

    //NOTE:: Debug 
    // console.log("generatedValues: ", generatedValues);
    return generatedValues;
}




/**
 * Evaluates a formula using generated values.
 * @param {string} formula - The formula as a string.
 * @param {Object} values - An object containing variable-value mappings.
 * @returns {number|string} - The computed result or an error message.
 */
function extractValue(value) {
    if (Array.isArray(value)) {
        // `[min, max]` format
        if (value.length === 2 && typeof value[0] === "number" && typeof value[1] === "number" &&
            value[0] < value[1]) {
                return Math.floor(Math.random() * (value[1] - value[0] + 1)) + value[0];
        } 
        // `[min, max, step]` format
        else if (value.length === 3 && 
                 typeof value[0] === "number" && typeof value[1] === "number" && typeof value[2] === "number" &&
                 value[0] < value[1] && (value[1] - value[0]) > value[2]) {
                    const [min, max, step] = value;
                    const range = Math.floor((max - min) / step);
                    return  min + step * Math.floor(Math.random() * (range + 1));

        // List selection
        } else {
            return value[Math.floor(Math.random() * value.length)];
        }
    }

    // Default case
    return value;
}


/**
 * Evaluates a formula using generated values.
 * @param {string} formula - The formula as a string.
 * @param {Object} values - An object containing variable-value mappings.
 * @returns {number|string} - The computed result or an error message.
 */
function evaluateCondition(condition, values) {
    condition = condition.replace(/([a-zA-Z_]+)/g, (match) => values[match] ?? match);
    try {
        if (eval(condition)) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.error("Error evaluating condition:", error);
        return null;
    } 
}

/**
 * Replaces placeholders in a question string with values and formats numbers.
 * @param {string} question - The question template with placeholders.
 * @param {Object} generatedValues - The values to insert into the question.
 * @returns {string} - The formatted question.
 */
function formatQuestionText(question, generatedValues) {
    let question_txt = question;

    for (const key in generatedValues) {
        const regex = new RegExp(`%%${key}%%`, "g");

        // If the value is a number, format it to 2 decimal places
        let formattedValue = generatedValues[key];
        if (typeof formattedValue === "number") {
            if (Number.isInteger(formattedValue)) {
                formattedValue = formattedValue.toString(); // Keep whole numbers as is
            } else {
                formattedValue = (Math.round((formattedValue + Number.EPSILON) * 100) / 100).toFixed(2); // Format floats
            }
        }
        // Replace the placeholder with the formatted value
        question_txt = question_txt.replace(regex, formattedValue);
    }

    return question_txt;
}

/**
 * Evaluates a formula using generated values.
 * @param {string} formula - The formula as a string.
 * @param {Object} values - An object containing variable-value mappings.
 * @returns {number|string} - The computed result or an error message.
 */
function evaluateFormula(formula, values) {
    try {
        // Ensure all required values exist
        for (const key of Object.keys(values)) {
            if (values[key] === undefined || values[key] === null) {
                throw new Error(`Variable ${key} is undefined in formula`);
            }
        }

        // Evaluate formula safely
        return new Function(...Object.keys(values), `return ${formula};`)(...Object.values(values));
    } catch (err) {
        console.error("Error evaluating formula:", err);
        return null;
    }
}

// Export all helper functions
module.exports = {
    generateValues,
    formatQuestionText
};