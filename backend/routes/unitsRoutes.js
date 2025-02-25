const express = require("express");
const router = express.Router();
const { addRecord, getRecords, getRecordById, updateRecord, deleteRecord } = require("../models/questionModel");


// ----------------------------- Help Fuctions -----------------------------

/**
 * Validates the 'accepted_answer' field to ensure it is a JSON array of strings.
 * This function attempts to parse the input string as JSON and checks whether the resulting
 * value is an array where every element is a string. If parsing fails or if any element
 * is not a string, the function returns false.
 *
 * @param {string} acceptedAnswer - The accepted_answer field as a JSON-encoded string array.
 * @returns {boolean} - Returns true if the input is a valid JSON array of strings, otherwise false.
 */
const validateAcceptedAnswer = (acceptedAnswer) => {
    try {
        const parsed = JSON.parse(acceptedAnswer);
        return Array.isArray(parsed) && parsed.every(item => typeof item === "string");
    } catch {
        return false;
    }
};


// ----------------------------- Add Entry -----------------------------

/**
 * @route POST /units/add
 * @desc Adds a new unit record to the database.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body containing ascii_name and accepted_answer.
 * @param {string} req.body.ascii_name - The unique name of the unit.
 * @param {string} req.body.accepted_answer - A JSON string representing an array of accepted answers.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response with success status and message.
 */
router.post("/units/add", async (req, res) => {
    try {
        const { ascii_name, accepted_answer } = req.body;
        if (!ascii_name || !accepted_answer) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        
        if (!validateAcceptedAnswer(accepted_answer)) {
            return res.status(400).json({ success: false, message: "Invalid accepted_answer format. Must be a JSON array of strings." });
        }
        try {
            const result = await addRecord("units", ["ascii_name", "accepted_answer"], [ascii_name, accepted_answer]);
            res.status(201).json({ success: true, message: "Record successfully added", id: result.id });
        } catch (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ success: false, message: "ascii_name must be unique. The provided value already exists." });
            }
            throw err;
        }
    } catch (err) {
        res.status(err.status || 500).json({ success: false, message: err.message || "Error adding record" });
    }
});


// ----------------------------- Export Routes -----------------------------
module.exports = router;