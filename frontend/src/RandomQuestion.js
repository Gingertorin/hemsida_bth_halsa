import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RandomQuestion.css";

const RandomQuestion = () => {
  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]); // Store available courses
  const [selectedCourse, setSelectedCourse] = useState(""); // Store user selection

  // Fetch available courses from the backend
  const fetchCourses = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/course/all");
      if (response.data.records) {
        setCourses(response.data.records);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    }
  };

  // Fetch a random question based on the selected course
  const fetchRandomQuestion = async () => {
    if (!selectedCourse) {
      setFeedback("Please select a course first.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5000/api/question/random?course_code=${selectedCourse}`);
      if (response.data.success) {
        setQuestionData(response.data.data);
        setFeedback("");
        setUserAnswer("");
      } else {
        setFeedback("No question found for this course.");
      }
    } catch (error) {
      console.error("Error fetching question:", error);
      setFeedback("Error fetching question.");
    }
    setLoading(false);
  };

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Handle answer submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!questionData) return;

    const correctAnswer = parseFloat(questionData.computed_answer);
    const userAnswerNumber = parseFloat(userAnswer);

    if (!isNaN(userAnswerNumber) && userAnswerNumber === correctAnswer) {
      setFeedback("Correct! 🎉");
    } else {
      setFeedback(`Incorrect. The correct answer is ${correctAnswer}.`);
    }
  };

  return (
    <div className="random-question-container">
      <h2>Slumpmässig Fråga</h2>

      {/* Course Selection Dropdown */}
      <div className="course-selector">
        <label>Välj en kurs:</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
        <option value="">-- Välj en kurs --</option>
        {courses.map((course) => (
            <option key={course.id} value={course.code}>
            {course.course_code}: {course.course_name} {/* Ensuring both code & name are shown */}
            </option>
        ))}
        </select>
      </div>

      <button onClick={fetchRandomQuestion} disabled={!selectedCourse}>Hämta Fråga</button>

      {loading && <p>Laddar...</p>}

      {questionData ? (
        <div>
          <p><strong>Fråga:</strong> {questionData.question}</p>
          <form onSubmit={handleSubmit}>
            <label>Ditt svar ({questionData.answer_unit}):</label>
            <input
              type="text"
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder="Ange ditt svar"
              required
            />
            <button type="submit">Skicka</button>
          </form>
          {feedback && <p className="feedback">{feedback}</p>}
        </div>
      ) : (
        <p>{feedback}</p>
      )}
    </div>
  );
};

export default RandomQuestion;
