const request = require("../../../backend/node_modules/supertest");
const express = require("../../../backend/node_modules/express");
const questionRoutes = require("../../../backend/routes/questionRoutes");
const { getRecords } = require("../../../backend/models/questionModel");

// Mock the functions from questionModel
jest.mock("../../../backend/models/questionModel", () => ({
    getRecords: jest.fn(),
}));

// Create an Express instance and mount the routes
const app = express();
app.use(express.json());
app.use(questionRoutes); // Ensure correct route mounting

describe("GET /question/random", () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test("should return a random question when valid course_code is provided", async () => {
        getRecords.mockResolvedValue([
            { id: 1, question: "What is %%test1%% + %%test1%%?", variating_values: '{"test1": [1,10]}', answer_formula: "2 * test1", course_code: "KM1423", question_type_id: 1 },
        ]);

        console.log("Mock calls:", getRecords.mock.calls); // Debugging Jest mock
        const response = await request(app).get("/question/random").query({ course_code: "KM1423" });

        console.log("Response status:", response.status); // Debugging response
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(response.body.data).toHaveProperty("question");
    });

    test("should return 400 if no course_code or question_type_id is provided", async () => {
        const response = await request(app).get("/question/random");
        expect(response.status).toBe(400);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("A course code or question type ID must be provided.");
    });

    test("should return 404 if no questions are found", async () => {
        getRecords.mockResolvedValue([]);

        const response = await request(app).get("/question/random").query({ course_code: "UNKNOWN" });
        expect(response.status).toBe(404);
        expect(response.body.success).toBe(false);
        expect(response.body.message).toBe("No questions found for the given filters.");
    });
});
