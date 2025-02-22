import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AddQuestion.css'; // Optional: Include your CSS for styling

const AddQuestion = () => {
  // Form state for the question details
  const [question, setQuestion] = useState('');
  const [answerUnit, setAnswerUnit] = useState('');
  const [answerFormula, setAnswerFormula] = useState('');
  const [variatingValues, setVariatingValues] = useState('');
  const [course, setCourse] = useState('');
  const [questionType, setQuestionType] = useState('');

  // Data from other tables (fetched via new routes)
  const [courses, setCourses] = useState([]);
  const [qtypes, setQtypes] = useState([]);
  const [units, setUnits] = useState([]);

  // State for course modal popup
  const [isCourseModalOpen, setCourseModalOpen] = useState(false);
  const [newCourseCode, setNewCourseCode] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [newQtypeList, setnewQtypeList] = useState('');
  const [isSavingCourse, setIsSavingCourse] = useState(false);
  const [courseSaveMessage, setCourseSaveMessage] = useState('');

  // Fetch available courses, question types, and units on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const coursesRes = await axios.get('/api/course/all');
        setCourses(coursesRes.data);

        const qtypesRes = await axios.get('/api/qtype/all');
        setQtypes(qtypesRes.data);

        const unitsRes = await axios.get('/api/units/all');
        setUnits(unitsRes.data);
      } catch (err) {
        console.error('Error fetching data:', err);
      }
    };

    fetchData();
  }, []);

  // Handle main question form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newQuestion = {
      question,
      answer_unit_id: answerUnit,
      answer_formula: answerFormula,
      variating_values: variatingValues, // Should be a valid JSON string
      course_code,
      question_type_id: questionType
    };

    try {
      const response = await axios.post('/api/question/add', newQuestion);
      console.log('Question added successfully:', response.data);
      // Clear form fields after success
      setQuestion('');
      setAnswerUnit('');
      setAnswerFormula('');
      setVariatingValues('');
      setCourse('');
      setQuestionType('');
    } catch (error) {
      console.error('Error adding question:', error);
    }
  };

  // Handle changes in the course dropdown
  const handleCourseChange = (e) => {
    if (e.target.value === '__new__') {
      setCourseModalOpen(true);
    } else {
      setCourse(e.target.value);
    }
  };

  // Handle submission of the new course from the modal
  const handleNewCourseSubmit = async (e) => {
    e.preventDefault();
    console.log('Saving new course:', newCourseCode, newCourseName);
    setIsSavingCourse(true);
    setCourseSaveMessage('Saving course...');
    try {
      const res = await axios.post('http://localhost:5000/api/course/add', { code: newCourseCode, name: newCourseName, question_type: newQtypeList });
      if (res && res.data) {
        // Update courses list with the new course
        setCourses((prevCourses) => [...prevCourses, res.data]);
        // Set the new course as the selected course
        setCourse(newCourseCode);
        setCourseSaveMessage('Course saved successfully!');
        // Reset modal fields after a short delay
        setTimeout(() => {
          setNewCourseCode('');
          setNewCourseName('');
          setCourseModalOpen(false);
          setCourseSaveMessage('');
        }, 1000);
      } else {
        setCourseSaveMessage('Error: No response data');
      }
    } catch (err) {
      console.error('Error adding new course:', err);
      setCourseSaveMessage('Error saving course');
    }
    setIsSavingCourse(false);
  };

  return (
    <div className="add-question">
      <h2>Add a New Question</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Enter the question text"
            rows="4"
          ></textarea>
        </div>

        <div>
          <label>Answer Unit</label>
          <select value={answerUnit} onChange={(e) => setAnswerUnit(e.target.value)}>
            <option value="">Select a unit</option>
            {units.map((unit) => (
              <option key={unit.id} value={unit.name}>
                {unit.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>Answer Formula</label>
          <input
            type="text"
            value={answerFormula}
            onChange={(e) => setAnswerFormula(e.target.value)}
            placeholder="e.g. var_name * 1000"
          />
        </div>

        <div>
          <label>Variating Values (JSON format)</label>
          <textarea
            value={variatingValues}
            onChange={(e) => setVariatingValues(e.target.value)}
            placeholder='e.g. {"var1": [4,16]}'
            rows="3"
          ></textarea>
        </div>

        <div>
          <label>Course</label>
          <select value={course} onChange={handleCourseChange}>
            <option value="">Select a course</option>
            {courses.map((crs) => (
              <option key={crs.id} value={crs.code}>
                {crs.code}
              </option>
            ))}
            <option value="__new__">Add new course</option>
          </select>
        </div>

        <div>
          <label>Question Type</label>
          <select value={questionType} onChange={(e) => setQuestionType(e.target.value)}>
            <option value="">Select a question type</option>
            {qtypes.map((qt) => (
              <option key={qt.id} value={qt.type}>
                {qt.type}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">Add Question</button>
      </form>

      {isCourseModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Course</h3>
            <form onSubmit={handleNewCourseSubmit}>
              <div>
                <label>Course Code</label>
                <input
                  type="text"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  placeholder="e.g. KM1423"
                  required
                />
              </div>
              <div>
                <label>Course Name</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Enter course name"
                />
              </div>
              <button type="submit" disabled={isSavingCourse}>
                {isSavingCourse ? 'Saving...' : 'Save Course'}
              </button>
              <button type="button" onClick={() => setCourseModalOpen(false)}>
                Cancel
              </button>
              {courseSaveMessage && <p>{courseSaveMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddQuestion;
