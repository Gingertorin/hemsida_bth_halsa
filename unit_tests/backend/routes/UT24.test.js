/**
 * UT24.test.js
 * 
 * This test verifies that the generateValues function from questionHelpers.js
 * produces a value for variable 'x' within the expected range based on the input JSON.
 */

const { generateValues } = jest.requireActual("../../../backend/helpers/questionHelpers");

describe("UT 24: Random values generation", () => {
  test("should generate a value for variable 'x' within the range [1, 3]", () => {
    // Define a sample variating_values JSON where 'x' should be between 1 and 3.
    const variatingValues = '{"x": [1, 3]}';
    
    // Call the actual implementation of generateValues.
    const values = generateValues(variatingValues);
    
    // Verify that 'x' exists and its value is within the expected range.
    expect(values).toHaveProperty("x");
    expect(values.x).toBeGreaterThanOrEqual(1);
    expect(values.x).toBeLessThanOrEqual(3);
  });
});
