import React, { useState, useEffect } from "react";
import axios from "axios";
import "./RandomQuestion.css";

const RandomQuestion = () => {
  const [questionData, setQuestionData] = useState(null);
  const [userAnswer, setUserAnswer] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");

  // Fetch courses from backend
  useEffect(() => {
    axios.get("http://localhost:5000/api/course/all").then((res) => {
      setCourses(res.data.records);
    });
  }, []);

  // Fetch a random question
  const fetchRandomQuestion = async () => {
    if (!selectedCourse) {
      setFeedback("Välj en kurs först.");
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
        setQuestionData("");
      }
    } catch (error) {
      setQuestionData("");
      if (error.response && error.response.status === 404) {
          setFeedback("Ingen fråga hittades.");
      } else {
          console.error("Error fetching question:", error);
          setFeedback("Fel vid hämtning av fråga.");
      }
  }
  setLoading(false);
  };

  // Handle answer submission using backend validation
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!questionData) return;

    try {
      const response = await axios.post("http://localhost:5000/api/question/check-answer", {
        answer: userAnswer,
        correctAnswer: questionData.computed_answer,
        correctUnit: questionData.answer_units.accepted_answer,
        formula: questionData.formula
      });

      setFeedback(response.data.message);
    } catch (error) {
      console.error("Error submitting answer:", error);
      setFeedback("Ett fel uppstod vid svarskontrollen.");
    }
  };

  return (
    <div className="random-question-container">
      <h2>Slumpmässig Fråga</h2>

      {/* Course Selection */}
      <div className="course-selector">
        <label>Välj en kurs:</label>
        <select value={selectedCourse} onChange={(e) => setSelectedCourse(e.target.value)}>
          <option value="">-- Välj en kurs --</option>
          {courses.map((course) => (
            <option key={course.course_code} value={course.course_code}>
              {course.course_code}: {course.course_name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={fetchRandomQuestion}>Hämta Fråga</button>

      {loading && <p>Laddar...</p>}

      {questionData ? (
        <div>
          <p>{questionData.question}</p>
          <form onSubmit={handleSubmit}>
            <label>Ditt svar ({questionData.answer_unit_id}):</label>
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
