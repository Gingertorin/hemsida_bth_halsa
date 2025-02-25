// test.skip("This test is a placeholder", () => {});
const request = require("supertest");
const express = require("express");
const app = express();
app.use(express.json());

// Import the router (adjust the path as needed)
const router = require("../routes/courseRoutes");
app.use("/", router);

// Mock the dependencies
jest.mock("../models/questionModel", () => ({
  addRecord: jest.fn(),
  getRecords: jest.fn(),
  getRecordById: jest.fn(),
  updateRecord: jest.fn(),
  deleteRecord: jest.fn(),
}));

jest.mock("../helpers/courseHelpers", () => ({
  validateCourseCode: jest.fn(),
}));

const { addRecord, getRecords } = require("../models/questionModel");
const { validateCourseCode } = require("../helpers/courseHelpers");

describe("POST /course/add", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 if required fields are missing", async () => {
    const res = await request(app)
      .post("/course/add")
      .send({});
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: "Missing required fields",
    });
  });

  it("should return 400 for an invalid course_code", async () => {
    // Simulate an invalid course code
    validateCourseCode.mockReturnValue(false);
    const payload = {
      course_code: "cs1001", // will be converted to uppercase in route
      course_name: "Test Course",
      question_types: JSON.stringify([1, 2]),
    };

    const res = await request(app).post("/course/add").send(payload);
    // validateCourseCode is called with "CS1001" (uppercased)
    expect(validateCourseCode).toHaveBeenCalledWith("CS1001");
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message:
        "Invalid course_code format. Must be two uppercase letters followed by four digits (e.g., CS1001).",
    });
  });

  it("should return 400 if question_types is invalid JSON", async () => {
    validateCourseCode.mockReturnValue(true);
    const payload = {
      course_code: "CS1001",
      course_name: "Test Course",
      question_types: "not a json", // invalid JSON string
    };

    const res = await request(app).post("/course/add").send(payload);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message:
        "Invalid question_types format or contains non-existent qtype IDs.",
    });
  });

  it("should return 409 when course_code already exists", async () => {
    validateCourseCode.mockReturnValue(true);
    // For a valid question_types, we need to simulate existing qtype IDs.
    getRecords.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const payload = {
      course_code: "CS1001",
      course_name: "Test Course",
      question_types: JSON.stringify([1, 2]),
    };

    // Simulate addRecord throwing an error due to duplicate course_code
    addRecord.mockRejectedValue({ message: "UNIQUE constraint failed" });

    const res = await request(app).post("/course/add").send(payload);
    expect(res.statusCode).toBe(409);
    expect(res.body).toEqual({
      success: false,
      message:
        "course_code must be unique. The provided value already exists.",
    });
  });

  it("should return 201 if record is added successfully", async () => {
    validateCourseCode.mockReturnValue(true);
    getRecords.mockResolvedValue([{ id: 1 }, { id: 2 }]);

    const fakeId = 123;
    addRecord.mockResolvedValue({ id: fakeId });

    const payload = {
      course_code: "CS1001",
      course_name: "Test Course",
      question_types: JSON.stringify([1, 2]),
    };

    const res = await request(app).post("/course/add").send(payload);
    expect(res.statusCode).toBe(201);
    expect(res.body).toEqual({
      success: true,
      message: "Record successfully added",
      id: fakeId,
    });
  });
});
