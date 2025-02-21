// File: tests/routes/unitsRoutes.test.js
const request = require("../../../backend/node_modules/supertest");
const express = require("../../../backend/node_modules/express");
const unitsRoutes = require("../../../backend/routes/unitsRoutes");
const { addRecord } = require("../../../backend/models/questionModel");

// Mock the functions from questionModel
jest.mock("../../../backend/models/questionModel");

describe("Units Routes", () => {
  // Create an express app and mount the units routes under /api
  const app = express();
  app.use(express.json());
  app.use("/api", unitsRoutes);

  // A valid unit record for testing.
  const validUnit = {
    ascii_name: "unit1",
    accepted_answer: '["answer1", "answer2"]'
  };

  it("should add a new unit record and return success message", async () => {
    addRecord.mockResolvedValue({ id: 1 });
    const res = await request(app)
      .post("/api/units/add")
      .send(validUnit);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body).toHaveProperty("message", "Record successfully added");
    expect(res.body).toHaveProperty("id", 1);
  });

  it("should return 400 error if required fields are missing", async () => {
    const res = await request(app)
      .post("/api/units/add")
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty("message", "Missing required fields");
  });

  it("should return 400 error for invalid accepted_answer format (not an array)", async () => {
    // accepted_answer is valid JSON but not an array.
    const invalidUnit = {
      ascii_name: "unit1",
      accepted_answer: '{"not": "an array"}'
    };
    const res = await request(app)
      .post("/api/units/add")
      .send(invalidUnit);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty(
      "message",
      "Invalid accepted_answer format. Must be a JSON array of strings."
    );
  });

  it("should return 400 error for invalid accepted_answer format (non-parseable JSON)", async () => {
    // accepted_answer is not valid JSON.
    const invalidUnit = {
      ascii_name: "unit1",
      accepted_answer: "not a json"
    };
    const res = await request(app)
      .post("/api/units/add")
      .send(invalidUnit);
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty(
      "message",
      "Invalid accepted_answer format. Must be a JSON array of strings."
    );
  });

  it("should return 409 error if ascii_name is not unique", async () => {
    // Simulate addRecord error with a UNIQUE constraint violation.
    addRecord.mockRejectedValue({
      message: "UNIQUE constraint failed: units.ascii_name",
      status: 409,
    });
    const res = await request(app)
      .post("/api/units/add")
      .send(validUnit);
    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty(
      "message",
      "ascii_name must be unique. The provided value already exists."
    );
  });

  it("should return 500 error on unexpected addRecord error", async () => {
    // Simulate a different type of error.
    addRecord.mockRejectedValue({
      status: 500,
      message: "Database error occurred.",
    });
    const res = await request(app)
      .post("/api/units/add")
      .send(validUnit);
    expect(res.status).toBe(500);
    expect(res.body.success).toBe(false);
    expect(res.body).toHaveProperty("message", "Database error occurred.");
  });

  it("should return 404 error when using a wrong HTTP method on /units/add", async () => {
    // If GET is not defined on /units/add, it should return 404.
    const res = await request(app).get("/api/units/add");
    expect(res.status).toBe(404);
  });
});
