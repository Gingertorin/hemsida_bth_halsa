const express = require("express");
const router = express.Router();
const { addRecord, getRecords, getRecordById, updateRecord, deleteRecord } = require("../models/questionModel");
const axios = require("axios");




// ----------------------------- Help Fuctions -----------------------------

async function isValidUrl(url) {
    try {
        const response = await axios.head(url);
        return response.status >= 200 && response.status < 300;
    } catch (error) {
        return false;
    }
}


// ----------------------------- Add Entry -----------------------------

/**
 * @route POST /course/add
 * @desc Adds a new course record to the database.
 * @param {Object} req - Express request object.
 * @param {Object} req.body - Request body.
 * @param {string} req.body.name - The name of the medicine.
 * @param {string} req.body.fass_link - The link to the FASS page for that medicine.
 * @param {string} req.body.skyrkor_doser - A JSON string with the doses.
 * @param {Object} res - Express response object.
 * @returns {Object} - JSON response with success status and message.
 */
router.post("/medicine/add", async (req, res) => {
    try {
        let { name, fass_link, styrkor_doser } = req.body;

        // Input validation
        if (!name || !fass_link || !styrkor_doser) {
            return res.status(400).json({ success: false, message: "Missing required fields: name, fass_link, styrkor_doser" });
        }
        if (typeof name !== "string" || typeof fass_link !== "string") {
            return res.status(400).json({ success: false, message: "Invalid data type: name and fass_link must be strings" });
        }

        // Ensure base URL is correct
        try {
            let urlObj = new URL(fass_link.startsWith("http") ? fass_link : "https://" + fass_link);

            // Force the base URL to "https://www.fass.se"
            urlObj.protocol = "https:";
            urlObj.host = "www.fass.se";

            // Ensure `userType=0` is present in search params
            if (!urlObj.searchParams.has("userType")) {
                urlObj.searchParams.append("userType", "0");
            } else {
                urlObj.searchParams.set("userType", "0"); // Ensure it is always set to 0
            }

            // Store the corrected URL
            fass_link = urlObj.toString();
        } catch (err) {
            return res.status(400).json({ success: false, message: "Invalid URL format for fass_link" });
        }

        // Check if URL is reachable
        const isReachable = await isValidUrl(fass_link);
        if (!isReachable) {
            return res.status(400).json({ success: false, message: "fass_link is not a valid or reachable website" });
        }

        // Ensure styrkor_doser is valid JSON
        try {
            JSON.parse(styrkor_doser);
        } catch (err) {
            return res.status(400).json({ success: false, message: "styrkor_doser must be a valid JSON string" });
        }

        // Insert into database
        try {
            const result = await addRecord("medicine", ["name", "fass_link", "styrkor_doser"], [name, fass_link, styrkor_doser]);
            return res.status(201).json({ success: true, message: "Record successfully added", id: result.id });
        } catch (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ success: false, message: "Medicine name must be unique. The provided value already exists." });
            }
            if (err.message.includes("FOREIGN KEY constraint failed")) {
                return res.status(400).json({ success: false, message: "Invalid foreign key reference" });
            }
            if (err.message.includes("CHECK constraint failed")) {
                return res.status(400).json({ success: false, message: "Data does not meet required constraints" });
            }
            throw err; // Re-throw for generic error handling
        }
    } catch (err) {
        console.error("Error in /medicine/add route:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});

module.exports = router;