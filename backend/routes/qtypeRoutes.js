const express = require("express");
const router = express.Router();
const { addRecord, updateRecord, getRecordById } = require("../models/questionModel");

router.post("/add", async (req, res) => {
    try {
        let { name } = req.body; // Only allow `name`

        // Validate name
        if (!name || typeof name !== "string") {
            return res.status(400).json({ success: false, message: "Invalid or missing 'name' (must be a string)" });
        }

        // Insert into database (right_answers, wrong_answers default to 0, history_json default to `{}`)
        try {
            const result = await addRecord(
                "qtype",
                ["name", "history_json"],
                [name, "{}"] // Default history_json to an empty object "{}"
            );
            return res.status(201).json({ success: true, message: "QType successfully added", id: result.id });
        } catch (err) {
            if (err.message.includes("UNIQUE constraint failed")) {
                return res.status(409).json({ success: false, message: "QType name must be unique. The provided value already exists." });
            }
            throw err;
        }
    } catch (err) {
        console.error("Error in /qtype/add route:", err);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
});



module.exports = router;