import React, { useState } from "react";
import "./App.css";
import AddQuestion from "./AddQuestion"; // Import AddQuestion component

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [selectedCourse, setSelectedCourse] = useState("course1");
  const [courseNumber, setCourseNumber] = useState("");

  return (
    <div className="App">
      <div className="container">
        {/* <h1>Läkemedelsberäkningar</h1> */}
        <header style={{ marginTop: "40px", color: "white" }}>
          <button onClick={() => setActiveTab("home")}>Home</button>
          <button onClick={() => setActiveTab("addQuestion")}>Add Question</button>

          {/* Dropdown Menu */}
          <select 
            value={selectedCourse} 
            onChange={(e) => setSelectedCourse(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px" }}
          >
            <option value="course1">Course 1</option>
            <option value="course2">Course 2</option>
            <option value="course3">Course 3</option>
          </select>

          {/* Input Field for Course Number */}
          <input
            type="number"
            placeholder="Enter number"
            value={courseNumber}
            onChange={(e) => setCourseNumber(e.target.value)}
            style={{ marginLeft: "10px", padding: "5px", width: "80px" }}
          />
        </header>
        <div className="content">
          {activeTab === "home" && (
            <div>
              <h2>Welcome to Home</h2>
              <p>Selected Course: {selectedCourse}</p>
              <p>Entered Number: {courseNumber}</p>
            </div>
          )}
          {activeTab === "addQuestion" && <AddQuestion />}
        </div>
      </div>
    </div>
  );
}

export default App;
