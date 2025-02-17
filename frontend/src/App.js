import React, { useState } from "react";
import "./App.css";
import AddQuestion from "./AddQuestion"; // Import AddQuestion component

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="App" >
      <div className="container" >
        {/* <h1>Läkemedelsberäkningar</h1> */}
        <header style={{ marginTop: "40px", color: "white" }}>
          <div style={{ display: "flex", justifyContent: "center", gap: "20px"}}>
          <button onClick={() => setActiveTab("home")}>Home</button>
          <button onClick={() => setActiveTab("addQuestion")}>Add Question</button>
          </div>
        </header>
        <div className="content">
          {activeTab === "home" && <h2>Welcome to Home</h2>}
          {activeTab === "addQuestion" && <AddQuestion />}
        </div>
      </div>
    </div>
  );
}

export default App;
