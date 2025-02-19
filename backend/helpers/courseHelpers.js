// ----------------------------- Course Help Fuctions  -----------------------------


/**
 * Validates the 'course_code' field to ensure it follows the pattern XX0000.
 * @param {string} courseCode - The course code to validate.
 * @returns {boolean} - Returns true if valid, otherwise false.
 */
const validateCourseCode = (courseCode) => {
    return /^[A-Z]{2}\d{4}$/.test(courseCode);
};

// Export all helper functions
module.exports = {
    validateCourseCode
};