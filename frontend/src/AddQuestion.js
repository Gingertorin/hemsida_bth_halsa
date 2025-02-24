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

  // State for qtype modal popup
  const [isQtypeModalOpen, setQtypeModalOpen] = useState(false);
  const [newQtypeName, setNewQtypeName] = useState('');
  const [isSavingQtype, setIsSavingQtype] = useState(false);
  const [qtypeSaveMessage, setQtypeSaveMessage] = useState('');

  // Functions to fetch fresh data from the backend
  const fetchCourses = async () => {
    try {
      const coursesRes = await axios.get('http://localhost:5000/api/course/all');
      setCourses(coursesRes.data.records);
    } catch (err) {
      console.error('Error fetching courses:', err);
    }
  };

  const fetchQtypes = async () => {
    try {
      const qtypesRes = await axios.get('http://localhost:5000/api/qtype/all');
      setQtypes(qtypesRes.data.records);
    } catch (err) {
      console.error('Error fetching question types:', err);
    }
  };

  const fetchUnits = async () => {
    try {
      const unitsRes = await axios.get('http://localhost:5000/api/units/all');
      setUnits(unitsRes.data.records);
    } catch (err) {
      console.error('Error fetching units:', err);
    }
  };

  // Fetch initial data on component mount
  useEffect(() => {
    fetchCourses();
    fetchQtypes();
    fetchUnits();
  }, []);

  // Handle main question form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const newQuestion = {
      question,
      answer_unit_id: answerUnit,
      answer_formula: answerFormula,
      variating_values: variatingValues, // Should be a valid JSON string
      course_code: course,
      question_type_id: questionType
    };

    try {
      const response = await axios.post('http://localhost:5000/api/question/add', newQuestion);
      console.log('Question added successfully:', response.data);
      // Clear form fields after success
      setQuestion('');
      setAnswerUnit('');
      setAnswerFormula('');
      setVariatingValues('');
      setCourse('');
      setQuestionType('');
      setnewQtypeList('');
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

  // Handle changes in the question type dropdown
  const handleQtypeChange = (e) => {
    if (e.target.value === '__new__') {
      setQtypeModalOpen(true);
    } else {
      setQuestionType(e.target.value);
    }
  };

  // Handle submission of the new course from the modal
  const handleNewCourseSubmit = async (e) => {
    e.preventDefault();
    console.log('Saving new course:', newCourseCode, newCourseName, newQtypeList);
    setIsSavingCourse(true);
    setCourseSaveMessage('Saving course...');
    try {
      const res = await axios.post('http://localhost:5000/api/course/add', { 
        code: newCourseCode, 
        name: newCourseName, 
        question_type: newQtypeList 
      });
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
          setnewQtypeList('');
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

  // Handle submission of the new question type from the qtype modal
  const handleNewQtypeSubmit = async (e) => {
    e.preventDefault();
    console.log('Saving new question type:', newQtypeName);
    setIsSavingQtype(true);
    setQtypeSaveMessage('Saving question type...');
    try {
      const res = await axios.post('http://localhost:5000/api/qtype/add', { name: newQtypeName });
      if (res && res.data) {
        // Update qtypes list with the new question type
        setQtypes((prevQtypes) => [...prevQtypes, res.data]);
        // Set the new question type as the selected one
        setQuestionType(res.data.id || newQtypeName);
        setQtypeSaveMessage('Question type saved successfully!');
        setTimeout(() => {
          setNewQtypeName('');
          setQtypeModalOpen(false);
          setQtypeSaveMessage('');
        }, 1000);
      } else {
        setQtypeSaveMessage('Error: No response data');
      }
    } catch (err) {
      console.error('Error adding new question type:', err);
      setQtypeSaveMessage('Error saving question type');
    }
    setIsSavingQtype(false);
  };

  return (
    <div className="add-question">
      <h2>Lägg Till En Ny Fråga</h2>
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend>Fråga Detaljer</legend>
          {/* Question text */}
          <div>
            <label className="question-label">Fråga</label>
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Enter the question text"
              rows="4"
            ></textarea>
          </div>
          {/* Answer unit and formula */}
          <div>
            <label className="bold-label">Svars Enhet</label>
            <select
              value={answerUnit}
              onChange={(e) => setAnswerUnit(e.target.value)}
              onFocus={fetchUnits}
            >
              <option value="">Välj En Enhet</option>
              {Array.isArray(units) && units.length > 0 ? (
                units.map((unit) => (
                  <option key={unit.id} value={unit.name}>
                    {unit.name}
                  </option>
                ))
              ) : (
                <option disabled>Inga Enheter Tillgängliga</option>
              )}
            </select>
          </div>
          <div>
            <label className="bold-label">Svars Formel</label>
            <input
              type="text"
              value={answerFormula}
              onChange={(e) => setAnswerFormula(e.target.value)}
              placeholder="e.g. var_name * 1000"
            />
          </div>
          <div>
            <label className="variating-values-label">Varierande Värden (JSON Format)</label>
            <textarea
              value={variatingValues}
              onChange={(e) => setVariatingValues(e.target.value)}
              placeholder='e.g. {"var1": [4,16]}'
              rows="3"
            ></textarea>
          </div>
        </fieldset>
        <fieldset>
          <legend>Kurs &amp; Fråge Typ</legend>
          {/* Course field */}
          <div>
            <label className="bold-label">Kurs</label>
            <select 
              value={course} 
              onChange={handleCourseChange}
              onFocus={fetchCourses}
            >
              <option value="">Välj En Kurs</option>
              {Array.isArray(courses) && courses.length > 0 ? (
                courses.map((crs) => (
                  <option key={crs.id} value={crs.code}>
                    {crs.code}
                  </option>
                ))
              ) : (
                <option disabled>Inga Kurser Tillgängliga</option>
              )}
              <option value="__new__">Lägg Till En Ny Kurs</option>
            </select>
          </div>
          {/* Question type field */}
          <div>
            <label className="bold-label">Fråge Typ</label>
            <select 
              value={questionType} 
              onChange={handleQtypeChange}
              onFocus={fetchQtypes}
            >
              <option value="">Välj En Frågetyp</option>
              {Array.isArray(qtypes) && qtypes.length > 0 ? (
                qtypes.map((qt) => (
                  <option key={qt.id} value={qt.id}>
                    {qt.name}
                  </option>
                ))
              ) : (
                <option disabled>Inga Frågetyper Tillgängliga</option>
              )}
              <option value="__new__">Lägg Till En Ny Frågetype</option>
            </select>
          </div>
        </fieldset>
        <button type="submit">Lägg till Fråga</button>
      </form>

      {/* Course Modal */}
      {isCourseModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Course</h3>
            <form onSubmit={handleNewCourseSubmit}>
              <div>
                <label>Kurs Kod</label>
                <input
                  type="text"
                  value={newCourseCode}
                  onChange={(e) => setNewCourseCode(e.target.value)}
                  placeholder="e.g. KM1423"
                  required
                />
              </div>
              <div>
                <label>Kurs Namn</label>
                <input
                  type="text"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  placeholder="Enter course name"
                />
              </div>
              <div>
                <label>Fråge Typ Lista</label>
                <input
                  type="text"
                  value={newQtypeList}
                  onChange={(e) => setnewQtypeList(e.target.value)}
                  placeholder='["qtype_id1", "qtype_id2"]'
                />
              </div>
              <button type="submit" disabled={isSavingCourse}>
                {isSavingCourse ? 'Saving...' : 'Submit'}
              </button>
              <button type="button" onClick={() => setCourseModalOpen(false)}>
                Cancel
              </button>
              {courseSaveMessage && <p>{courseSaveMessage}</p>}
            </form>
          </div>
        </div>
      )}

      {/* Question Type Modal */}
      {isQtypeModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Add New Question Type</h3>
            <form onSubmit={handleNewQtypeSubmit}>
              <div>
                <label>Fråge Typ Namn</label>
                <input
                  type="text"
                  value={newQtypeName}
                  onChange={(e) => setNewQtypeName(e.target.value)}
                  placeholder="e.g. Dosage Calculation"
                  required
                />
              </div>
              <button type="submit" disabled={isSavingQtype}>
                {isSavingQtype ? 'Saving...' : 'Submit'}
              </button>
              <button type="button" onClick={() => setQtypeModalOpen(false)}>
                Cancel
              </button>
              {qtypeSaveMessage && <p>{qtypeSaveMessage}</p>}
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AddQuestion;
