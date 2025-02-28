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

function checkAnswer(userAnswer, correctAnswer, correctUnits, formula) {


    try {
        correctUnits = JSON.parse(correctUnits);
    } catch (error) {
        console.error("Error parsing accepted_answers:", error);
        return res.status(500).json({ success: false, message: "Invalid accepted_answers format." });
    }
    

    const answerPattern = /^\s*([\d.,]+)\s*([a-zA-Z]*)\s*$/; // Extract number and unit with optional whitespace
    const match = userAnswer.match(answerPattern);

    if (!match) {
        return { correct: false, message: "Invalid format. Use number followed by unit (e.g., '5 kg')." };
    }

    let userValue = match[1].replace(',', '.'); // Replace comma with dot for decimal parsing
    userValue = parseFloat(userValue);

    if (isNaN(userValue)) {
        return { correct: false, message: "Invalid number format. Use a valid numeric value (e.g., '5.5 kg' or '5,5 kg')." };
    }

    const userUnit = match[2].trim(); // Trim unnecessary whitespace from unit

    // Ensure correctUnits is an array (supports multiple accepted unit names)
    if (!Array.isArray(correctUnits)) {
        correctUnits = [correctUnits]; // Convert to array if it's a single unit
    }

    // 🔹 Round both user answer and correct answer to 2 decimal places for comparison
    const roundedUserValue = parseFloat(userValue.toFixed(2));
    const roundedCorrectAnswer = parseFloat(correctAnswer.toFixed(2));

    if (roundedUserValue !== roundedCorrectAnswer) {
        return {
            correct: false,
            message: `Incorrect answer. Expected ${roundedCorrectAnswer} ${correctUnits[0]}. Calculation: ${formatFormula(formula)}`
        };
    }

    return { correct: true, message: "Correct!" };
}

function formatFormula(formula) {
    return formula.replace(/\d+\.\d+/g, match => parseFloat(match).toFixed(2));
}


// Export all helper functions
module.exports = {
    generateValues,
    formatQuestionText,
    checkAnswer
};