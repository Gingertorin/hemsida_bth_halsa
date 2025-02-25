const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const questionsRoutes = require("./routes/questionRoutes");

const app = express();

// -------------------------- Middleware -----------------------------
app.use(cors());
app.use(bodyParser.json());
app.use("/api/question", questionsRoutes); // Handles all question-related routes


// -------------------------- Start Backend -----------------------------

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
