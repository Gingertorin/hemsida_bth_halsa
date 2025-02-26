/**
 * @file __tests__/yourRouter.test.js
 * Test suite for the Express Router that handles /:table/all endpoints
 */

const request = require("../../../backend/node_modules/supertest");
const express = require("../../../backend/node_modules/express");
const router = require("../../../backend/routes/commonRoutes");

// Mock the model so it doesn't do real DB operations
jest.mock("../../../backend/models/questionModel", () => ({
  getRecords: jest.fn(),
  getRecordById: jest.fn(),
}));

const { getRecords } = require("../../../backend/models/questionModel");

// Helper function to set up an Express app using our router
function createTestApp() {
  const app = express();
  app.use(express.json());
  // Mount the router at /api
  app.use('/api', router);
  return app;
}

describe('Test the /:table/all route', () => {
  let app;

  beforeAll(() => {
    app = createTestApp();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 and the records for a valid table', async () => {
    // Mock getRecords to return some data
    const mockData = [{ id: 1, name: 'Sample' }];
    getRecords.mockResolvedValue(mockData);

    const validTable = 'units'; // One of the allowed tables in your code
    const res = await request(app).get(`/api/${validTable}/all`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      success: true,
      records: mockData,
    });
    // Make sure our mock was called with the correct table name
    expect(getRecords).toHaveBeenCalledWith(validTable);
  });

  it('should return 400 for an invalid table name', async () => {
    const invalidTable = 'notARealTable';
    const res = await request(app).get(`/api/${invalidTable}/all`);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({
      success: false,
      message: 'Invalid table name',
    });
    // The model function should NOT be called in this case
    expect(getRecords).not.toHaveBeenCalled();
  });

  it('should return 500 if getRecords throws an error', async () => {
    // Force getRecords to reject (simulating DB error)
    getRecords.mockRejectedValue(new Error('DB failed'));

    const validTable = 'units';
    const res = await request(app).get(`/api/${validTable}/all`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({
      success: false,
      message: 'Error fetching records',
    });
    expect(getRecords).toHaveBeenCalledWith(validTable);
  });
});
