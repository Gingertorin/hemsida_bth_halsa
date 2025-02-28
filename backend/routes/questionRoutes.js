const express = require("express");
const router = express.Router();
const { addRecord, getRecords, getQuestion } = require("../models/questionModel");
const { isValidJsonArray, isPositiveInteger, getRandomElement } = require("../helpers/routeHelpers");
const { generateValues, formatQuestionText} = require("../helpers/questionHelpers");




// ----------------------------- Add Entry -----------------------------

/**
 * @route POST /question/add
 * @desc Adds a new question to the database.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing question details.
 * @param {string} req.body.question - The text of the question.
 * @param {number} req.body.answer_unit_id - The ID of the answer unit (must exist in the units table).
 * @param {string} req.body.answer_formula - The formula for calculating the answer.
 * @param {string} req.body.variating_values - A JSON string representing an array of variating values.
 * @param {string} req.body.course_code - The course code (will be converted to uppercase).
 * @param {number} req.body.question_type_id - The ID of the question type (must exist in the qtype table).
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response with success status and message.
 */
router.post("/add", async (req, res) => {
    try {
        let { question, answer_unit_id, answer_formula, variating_values, course_code, question_type_id } = req.body;

        // Validate required fields
        if (!question || !answer_formula || !variating_values || !course_code || !answer_unit_id || !question_type_id) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        if (!isPositiveInteger(answer_unit_id) || !isPositiveInteger(question_type_id)) {
            return res.status(400).json({ success: false, message: "Invalid answer_unit_id or question_type_id format. Must be positive integers." });
        }

        if (!isValidJsonArray(variating_values)) {
            return res.status(400).json({ success: false, message: "variating_values must be a valid JSON array." });
        }

        course_code = course_code.toUpperCase()

        try {
            const result = await addRecord("question_data", 
                ["question", "answer_unit_id", "answer_formula", "variating_values", "course_code", "question_type_id"],
                [question, answer_unit_id, answer_formula, variating_values, course_code, question_type_id]
            );
            res.status(201).json({ success: true, message: "Question successfully added", id: result.id });
        } catch (err) {
            if (err.message.includes("FOREIGN KEY constraint failed")) {
                return res.status(400).json({ success: false, message: "Invalid foreign key reference. Ensure course_code, answer_unit_id, and question_type_id exist." });
            }
            throw err;
        }
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message || "Error adding question" });
    }
});

// ----------------------------- Get Question -----------------------------

/**
 * @route GET /question/random
 * @desc Retrieves a random question based on course_code or question_type_id, processes it by generating values and computing the answer.
 * @param {Object} req - Express request object.
 * @param {string} [req.query.course_code] - Optional course code filter.
 * @param {number} [req.query.question_type_id] - Optional question type ID filter.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response with a fully processed question or an error message.
 */
router.get("/random", async (req, res) => {
    try {
        const { course_code } = req.query;
        if (!course_code) {
            return res.status(400).json({ success: false, message: "A course code must be provided." });
        }

        const questions = await getQuestion(course_code);
        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: "No questions found." });
        }

        let question = getRandomElement(questions);

        let variatingValues;
        try {
            variatingValues = JSON.parse(question.variating_values);
        
            // If `variatingValues` is still a string after parsing, parse it again
            if (typeof variatingValues === "string") {
                variatingValues = JSON.parse(variatingValues);
            }
        } catch (error) {
            console.error("Error parsing variating_values:", error);
            return res.status(500).json({ success: false, message: "Invalid variating_values format." });
        }
        
        
        const medicineList = await getRecords("medicine");

        const generatedValues = generateValues(question.question, variatingValues, medicineList);

        // Ensure required values exist before evaluating the formula
        const missingKeys = Object.keys(generatedValues).filter(
            (key) => generatedValues[key] === undefined || generatedValues[key] === null
        );
        if (missingKeys.length > 0) {
            console.error("Missing variables for calculation:", missingKeys);
            return res.status(500).json({
                success: false,
                message: `Missing required values for formula: ${missingKeys.join(", ")}`,
            });
        }

        // Dynamically parse and compute the formula
        let computedAnswer = null;
        try {

            // Validate that all variables in the formula exist in generatedValues
            const formulaVars = question.answer_formula.match(/[a-zA-Z_]+/g) || [];
            const missingVars = formulaVars.filter(v => generatedValues[v] === undefined);

            if (missingVars.length > 0) {
                console.error("Missing variables for formula evaluation:", missingVars);
                return res.status(500).json({ 
                    success: false, 
                    message: `Missing required values for formula: ${missingVars.join(", ")}` 
                });
            }

            // Replace variables in the formula with actual values
            let parsedFormula = question.answer_formula;
            for (const key in generatedValues) {
                const regex = new RegExp(`\\b${key}\\b`, "g");
                parsedFormula = parsedFormula.replace(regex, generatedValues[key]);
            }

            // Ensure the final parsed formula contains only numbers and operators
            if (!/^[0-9+\-*/().\s]+$/.test(parsedFormula)) {
                console.error("Invalid formula after substitution:", parsedFormula);
                return res.status(500).json({ success: false, message: "Invalid formula format." });
            }

            // Compute result safely
            computedAnswer = new Function(`return ${parsedFormula};`)();

        } catch (err) {
            console.error("Error evaluating formula:", err);
            return res.status(500).json({ success: false, message: "Error evaluating formula." });
        }


        // Replace placeholders in the question text
        let processedQuestion = formatQuestionText(question.question, generatedValues);

        res.status(200).json({
            success: true,
            data: {
                id: question.id,
                question: processedQuestion,
                generated_values: generatedValues,
                computed_answer: computedAnswer,
                answer_unit_id: question.answer_unit_id,
                course_code: question.course_code,
                question_type_id: question.question_type_id,
            },
        });
    } catch (err) {
        console.error("Error:", err);
        res.status(500).json({ success: false, message: "Error retrieving question." });
    }
});

// ----------------------------- Export Routes -----------------------------
module.exports = router;