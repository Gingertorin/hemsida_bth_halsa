const request = require("../../../backend/node_modules/supertest");
const express = require("../../../backend/node_modules/express");
const router = require("../../../backend/routes/courseRoutes");

// Mock the model functions used inside the route
// (Because we only want to test how the route responds, not the DB itself)
jest.mock("../../../backend/models/questionModel", () => ({
  addRecord: jest.fn(),
  getRecords: jest.fn(),
  // you can mock others if they're also called
}));

const { addRecord, getRecords } = require("../../../backend/models/questionModel");

describe("POST /course/add", () => {
  let app;

  // Set up an Express app that uses our router
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.use("/course", router);
  });

  afterEach(() => {
    // Reset mocks between tests to avoid cross-test pollution
    jest.clearAllMocks();
  });

  // --------------------------------------------
  // 1) Missing Required Fields
  // --------------------------------------------
  it("should return 400 if required fields are missing", async () => {
    // No body => missing everything
    const res = await request(app).post("/course/add").send({});

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message: "Missing required fields",
    });
  });

  // --------------------------------------------
  // 2) Invalid course_code Format
  // --------------------------------------------
  it("should return 400 if course_code is invalid", async () => {
    // This code does not match "two letters + four digits" pattern
    const res = await request(app).post("/course/add").send({
      course_code: "123ABC",
      course_name: "Intro to Jest Testing",
      question_types: "[1, 2]",
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message:
        "Invalid course_code format. Must be two uppercase letters followed by four digits (e.g., CS1001).",
    });
  });

  // --------------------------------------------
  // 3) Invalid question_types 
  // (e.g., not a JSON array or includes non-existent IDs)
  // --------------------------------------------
  it("should return 400 if question_types is invalid or includes non-existent qtype IDs", async () => {
    // Mock getRecords to simulate existing qtypes with IDs 1,2
    getRecords.mockResolvedValue([{ id: 1 }, { id: 2 }]); 

    // Provide an invalid question_types array [1,99], where 99 doesn't exist
    const res = await request(app).post("/course/add").send({
      course_code: "CS1001",
      course_name: "Intro to Jest Testing",
      question_types: JSON.stringify([1, 99]), // 99 not in our mock
    });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({
      success: false,
      message:
        "Invalid question_types format or contains non-existent qtype IDs.",
    });
  });

  // --------------------------------------------
  // 4) Duplicate course_code 
  // (Simulate DB error for unique constraint)
  // --------------------------------------------
  it("should return 409 if the course_code is already in use", async () => {
    // Mock getRecords to pass question_types validation
    getRecords.mockResolvedValue([{ id: 1 }, { id: 2 }]); 
    // Mock addRecord to throw 'UNIQUE constraint failed'
    addRecord.mockRejectedValue({
      message: "UNIQUE constraint failed: course.course_code",
    });

    const res = await request(app).post("/course/add").send({
      course_code: "CS1001",
      course_name: "Intro to Jest Testing",
      question_types: "[1, 2]",
    });

    expect(res.status).toBe(409);
    expect(res.body).toMatchObject({
      success: false,
      message:
        "course_code must be unique. The provided value already exists.",
    });
  });

  // --------------------------------------------
  // 5) Successful Insertion
  // --------------------------------------------
  it("should return 201 if record is successfully added", async () => {
    // Mock getRecords to pass question_types validation
    getRecords.mockResolvedValue([{ id: 1 }, { id: 2 }]); 
    // Mock addRecord to return an inserted id
    addRecord.mockResolvedValue({ id: 42 });

    const res = await request(app).post("/course/add").send({
      course_code: "CS1001",
      course_name: "Intro to Jest Testing",
      question_types: "[1, 2]",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      success: true,
      message: "Record successfully added",
      id: 42, // from the mock
    });
  });

  // --------------------------------------------
  // 6) Generic Error 
  // (Something unexpected in the try/catch)
  // --------------------------------------------
  it("should return 500 if an unexpected error occurs", async () => {
    // Mock getRecords to pass question_types validation
    getRecords.mockResolvedValue([{ id: 1 }, { id: 2 }]);
    // Throw some random DB error 
    addRecord.mockRejectedValue({ message: "Some database meltdown" });

    const res = await request(app).post("/course/add").send({
      course_code: "CS1001",
      course_name: "Intro to Jest Testing",
      question_types: "[1, 2]",
    });

    expect(res.status).toBe(500);
    expect(res.body).toMatchObject({
      success: false,
      message: "Some database meltdown",
    });
  });
});
