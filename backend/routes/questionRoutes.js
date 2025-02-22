const express = require("express");
const router = express.Router();
const { addRecord, getRecords, getRecordById } = require("../models/questionModel");
const { isValidJsonArray, isPositiveInteger, getRandomElement } = require("../helpers/routeHelpers");
const { generateValues, evaluateFormula } = require("../helpers/questionHelpers");




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
router.post("/question/add", async (req, res) => {
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
router.get("/question/random", async (req, res) => {
    try {
        const { course_code, question_type_id } = req.query;

        if (!course_code && !question_type_id) {
            return res.status(400).json({ success: false, message: "A course code or question type ID must be provided." });
        }

        const filters = {};
        if (course_code) filters.course_code = course_code.toUpperCase();
        if (question_type_id && isPositiveInteger(Number(question_type_id))) {
            filters.question_type_id = Number(question_type_id);
        }

        const questions = await getRecords("question_data", filters);
        if (questions.length === 0) {
            return res.status(404).json({ success: false, message: "No questions found for the given filters." });
        }

        // Select a random question
        const randomQuestion = getRandomElement(questions);
        const generatedValues = generateValues(randomQuestion.variating_values);
        const computedAnswer = evaluateFormula(randomQuestion.answer_formula, generatedValues);

        // Process and return the question
        const processedQuestion = {
            id: randomQuestion.id,
            question: randomQuestion.question,
            generated_values: generatedValues,
            computed_answer: computedAnswer,
            course_code: randomQuestion.course_code,
            question_type_id: randomQuestion.question_type_id
        };
        console.log("Test")
        res.status(200).json({ success: true, data: processedQuestion });
    } catch (err) {
        res.status(500).json({ success: false, message: "Error retrieving and processing question" });
    }
});

// ----------------------------- Export Routes -----------------------------
module.exports = router;