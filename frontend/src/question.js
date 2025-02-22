import axios from "axios";
import { useEffect, useState } from "react";

const API_BASE_URL = "http://localhost:5000";

/**
 * Fetches a random question from the backend API.
 * @param {Object} params - Optional filters for fetching a question.
 * @param {string} [params.course_code] - Optional course code filter.
 * @param {number} [params.question_type_id] - Optional question type ID filter.
 * @returns {Promise<Object>} - A promise resolving to the fetched question data.
 */



export const getRandomQuestion = async (params = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/question/random?course_code=MATH101&question_type_id=1`);
    return response.data;
  } catch (error) {
    console.error("Error fetching question:", error);
    return { success: false, message: "Failed to fetch question" };
  }
};

const QuestionComponent = () => {
  const [question, setQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchQuestion = async () => {
    setLoading(true);
    setError(null);
    const data = await getRandomQuestion();
    console.log("Received data:", data); // Check what is being received

    if (data.success) {
      setQuestion(data.data);
    } else {
      setError(data.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchQuestion();
  }, []);

  return (
    <div>
      <h2>Random Question</h2>
      {loading ? (
        <p>Loading question...</p>
      ) : error ? (
        <p>Error: {error}</p>
      ) : (
        <div>
          <p><strong>Question:</strong> {question.question}</p>
          <p><strong>Generated Values:</strong> {JSON.stringify(question.generated_values)}</p>
          <p><strong>Computed Answer:</strong> {question.computed_answer}</p>
          <p><strong>question_type_id:</strong> {question.question_type_id}</p>
          <p><strong>course_code:</strong> {question.course_code}</p>
          <button onClick={fetchQuestion}>Next Question</button>
        </div>
      )}
    </div>
  );
};

export default QuestionComponent;