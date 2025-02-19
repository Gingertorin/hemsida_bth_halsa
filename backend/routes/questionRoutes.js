const express = require("express");
const router = express.Router();
const { addRecord, getRecords } = require("../models/questionModel");

// ----------------------------- Helper Functions -----------------------------

/**
 * Validates that a value is a positive integer.
 * @param {any} value - The value to check.
 * @returns {boolean} - Returns true if it's a valid positive integer.
 */
const isPositiveInteger = (value) => {
    return Number.isInteger(value) && value > 0;
};

/**
 * Validates if a string is a valid JSON array.
 * @param {string} jsonString - The JSON string to validate.
 * @returns {boolean} - Returns true if valid, otherwise false.
 */
const isValidJsonArray = (jsonString) => {
    try {
        const parsed = JSON.parse(jsonString);
        return Array.isArray(parsed);
    } catch {
        return false;
    }
};

/**
 * Converts the course code to uppercase.
 * @param {string} courseCode - The course code.
 * @returns {string} - The uppercase course code.
 */
const formatCourseCode = (courseCode) => {
    return courseCode.toUpperCase();
};

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

        course_code = formatCourseCode(course_code); // Convert course_code to uppercase

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

// ----------------------------- Export Routes -----------------------------
module.exports = router;