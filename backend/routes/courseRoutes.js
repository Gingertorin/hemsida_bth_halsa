const express = require("express");
const router = express.Router();
const { addRecord, getRecords, getRecordById, updateRecord, deleteRecord } = require("../models/questionModel");
const { validateCourseCode } = require("../helpers/courseHelpers");

// ----------------------------- Help Fuctions -----------------------------



/**
 * Validates the 'question_types' field to ensure it is a JSON array of existing qtype IDs.
 * @param {string} questionTypes - The question_types field as a JSON string.
 * @returns {boolean} - Returns true if valid, otherwise false.
 */
const validateQuestionTypes = async (questionTypes) => {
    try {
        const parsed = JSON.parse(questionTypes);
        if (!Array.isArray(parsed) || !parsed.every(num => Number.isInteger(num))) return false;
        
        // Check if IDs exist in qtype table
        const existingTypes = await getRecords("qtype");
        const existingIds = new Set(existingTypes.map(q => q.id));
        return parsed.every(id => existingIds.has(id));
    } catch {
        return false;
    }
};


// ----------------------------- Add Entry -----------------------------

/**
 * @route POST /course/add
 * @desc Adds a new course record to the database.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing course_code, course_name, and question_types.
 * @param {string} req.body.course_code - A unique course code formatted as XX0000.
 * @param {string} req.body.course_name - The name of the course.
 * @param {string} req.body.question_types - A JSON string representing an array of qtype IDs.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response with success status and message.
 */
router.post("/add", async (req, res) => {
    try {
        const { course_code, course_name, question_types } = req.body;
        if (!course_code || !course_name || !question_types) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        course_code = course_code.toUpperCase(); // Convert to uppercase before validation and storage

        if (!validateCourseCode(course_code)) {
            return res.status(400).json({ success: false, message: "Invalid course_code format. Must be two uppercase letters followed by four digits (e.g., CS1001)." });
        }
        if (!await validateQuestionTypes(question_types)) {
            return res.status(400).json({ success: false, message: "Invalid question_types format or contains non-existent qtype IDs." });
        }
        
        try {
            const result = await addRecord("course", ["course_code", "course_name", "question_types"], [course_code, course_name, question_types]);
            res.status(201).json({ success: true, message: "Record successfully added", id: result.id });
        } catch (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ success: false, message: "course_code must be unique. The provided value already exists." });
            }
            throw err;
        }
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message || "Error adding record" });
    }
});



// ----------------------------- Export Routes -----------------------------
module.exports = router;