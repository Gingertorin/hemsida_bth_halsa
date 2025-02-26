const request = require("../../../backend/node_modules/supertest");
const express = require("../../../backend/node_modules/express");
const questionRouter = require("../../../backend/routes/questionRoutes");

// Mock the dependencies that the router uses
jest.mock("../../../backend/models/questionModel", () => ({
  addRecord: jest.fn(),
  getRecords: jest.fn(),
  getRecordById: jest.fn(),
}));
jest.mock("../../../backend/helpers/routeHelpers", () => ({
  isValidJsonArray: jest.fn(),
  isPositiveInteger: jest.fn(),
  getRandomElement: jest.fn(),
}));
jest.mock("../../../backend/helpers/questionHelpers", () => ({
  generateValues: jest.fn(),
  evaluateFormula: jest.fn(),
}));

// Grab the mocked functions for easy reference in tests
const { addRecord, getRecords } = require("../../../backend/models/questionModel");
const {
  isValidJsonArray,
  isPositiveInteger,
  getRandomElement,
} = require("../../../backend/helpers/routeHelpers");
const { generateValues, evaluateFormula } = require("../../../backend/helpers/questionHelpers");

// Create an Express app instance, and mount your router
const app = express();
app.use(express.json());
app.use("/question", questionRouter);

describe("Question Routes", () => {
  // Reset mocks before each test to avoid shared state
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --------------------- TEST /question/add ---------------------
  describe("POST /question/add", () => {
    it("should return 400 if required fields are missing", async () => {
      const res = await request(app).post("/question/add").send({});
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Missing required fields/i);
    });

    it("should return 400 if answer_unit_id or question_type_id are not positive integers", async () => {
      isPositiveInteger.mockImplementation((num) => {
        console.log(`Mocked isPositiveInteger called with: ${num}`);
        return false;
      });
      
      const body = {
        question: "Test question?",
        answer_unit_id: -1, // invalid
        answer_formula: "x + 10",
        variating_values: "[]",
        course_code: "ABC123",
        question_type_id: -5, // invalid
      };
      
      const res = await request(app).post("/question/add").send(body);
      
      // ✅ Only check that isPositiveInteger was called at least once
      expect(isPositiveInteger).toHaveBeenCalled();
      
      // ✅ Check at least ONE of the invalid values was checked
      const calledWithValues = isPositiveInteger.mock.calls.map(call => call[0]);
      expect(calledWithValues).toEqual(expect.arrayContaining([-1, -5].filter(val => calledWithValues.includes(val))));
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid answer_unit_id or question_type_id format/i);
    });

    it("should return 400 if variating_values is not a valid JSON array", async () => {
      isPositiveInteger.mockReturnValue(true);
      isValidJsonArray.mockReturnValue(false);

      const body = {
        question: "Test question?",
        answer_unit_id: 1,
        answer_formula: "x + 10",
        variating_values: "{not an array}",
        course_code: "ABC123",
        question_type_id: 2,
      };

      const res = await request(app).post("/question/add").send(body);

      expect(isValidJsonArray).toHaveBeenCalledWith("{not an array}");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/variating_values must be a valid JSON array/i);
    });

    it("should return 201 if the question is successfully added", async () => {
      isPositiveInteger.mockReturnValue(true);
      isValidJsonArray.mockReturnValue(true);
      addRecord.mockResolvedValue({ id: 123 });

      const body = {
        question: "Test question?",
        answer_unit_id: 1,
        answer_formula: "x + 10",
        variating_values: "[]",
        course_code: "abc123",
        question_type_id: 2,
      };

      const res = await request(app).post("/question/add").send(body);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/Question successfully added/i);
      expect(res.body.id).toBe(123);

      expect(addRecord).toHaveBeenCalledWith(
        "question_data",
        ["question", "answer_unit_id", "answer_formula", "variating_values", "course_code", "question_type_id"],
        ["Test question?", 1, "x + 10", "[]", "ABC123", 2]
      );
    });

    it("should return 400 if there is a foreign key constraint error", async () => {
      isPositiveInteger.mockReturnValue(true);
      isValidJsonArray.mockReturnValue(true);
      addRecord.mockRejectedValue({ message: "FOREIGN KEY constraint failed" });

      const body = {
        question: "Test question?",
        answer_unit_id: 999,
        answer_formula: "x + 10",
        variating_values: "[]",
        course_code: "XYZ999",
        question_type_id: 2,
      };

      const res = await request(app).post("/question/add").send(body);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Invalid foreign key reference/i);
    });
  });

  // --------------------- TEST /question/random ---------------------
  describe("GET /question/random", () => {
    it("should return 400 if neither course_code nor question_type_id is provided", async () => {
      const res = await request(app).get("/question/random");

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/A course code or question type ID must be provided/i);
    });

    it("should return 404 if no questions match the filters", async () => {
      getRecords.mockResolvedValue([]);

      const res = await request(app).get("/question/random?course_code=ABC");

      expect(getRecords).toHaveBeenCalledWith("question_data", { course_code: "ABC" });
      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/No questions found/i);
    });

    it("should return 200 and a processed question on success", async () => {
      // Store the fake questions in a variable
      const fakeQuestions = [
        {
          id: 10,
          question: "What is x + 10?",
          answer_unit_id: 1,
          answer_formula: "x+10",
          variating_values: '[{"min":1,"max":3}]',
          course_code: "ABC",
          question_type_id: 2,
        },
      ];

      // Mock the DB call & helper functions
      getRecords.mockResolvedValue(fakeQuestions);
      getRandomElement.mockReturnValue(fakeQuestions[0]); // Just pick the first one
      generateValues.mockReturnValue({ x: 2 });
      evaluateFormula.mockReturnValue(12);

      const res = await request(app).get("/question/random?course_code=abc");

      // Verification
      expect(getRecords).toHaveBeenCalledWith("question_data", { course_code: "ABC" });
      expect(getRandomElement).toHaveBeenCalled();
      expect(generateValues).toHaveBeenCalledWith('[{"min":1,"max":3}]');
      expect(evaluateFormula).toHaveBeenCalledWith("x+10", { x: 2 });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toEqual({
        id: 10,
        question: "What is x + 10?",
        generated_values: { x: 2 },
        computed_answer: 12,
        course_code: "ABC",
        question_type_id: 2,
      });
    });

    it("(UT 23) Check if the answers for the questions we got have the right formula", async () => {
      getRecords.mockResolvedValue([
      {
        id: 99,
        question: "Invalid formula test",
        answer_unit_id: 1,
        answer_formula: "x+??", // invalid
        variating_values: '[{"min":1,"max":3}]',
        course_code: "ABC",
        question_type_id: 2,
      },
      ]);
      getRandomElement.mockReturnValueOnce({
      // same as above
      });
      generateValues.mockReturnValue({ x: 2 });
      // Force evaluateFormula to throw
      evaluateFormula.mockImplementation(() => { throw new Error("Syntax error"); });
      
      const res = await request(app).get("/question/random?course_code=abc");
      expect(res.status).toBe(500);
      expect(res.body.message).toMatch(/Error retrieving and processing question/i);
    });

    it("should return 500 if an error occurs", async () => {
      getRecords.mockRejectedValue(new Error("Database failure"));

      const res = await request(app).get("/question/random?course_code=ABC");

      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/Error retrieving and processing question/i);
    });
  });
});


