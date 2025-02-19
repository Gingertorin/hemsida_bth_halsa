import React, { useState } from "react";
import "./App.css";

import AddQuestion from "./AddQuestion"




function App() {
  const [activeTab, setActiveTab] = useState("home");


  return (
    <div className="App">
      <div className="container">
        {/* <h1>Läkemedelsberäkningar</h1> */}
        <nav style={{marginTop: "40px", color: "white"}}>
          <button onClick={() => setActiveTab("home")}>Hem</button>
          <button onClick={() => setActiveTab("upload")}>Lägg Till Frågor</button>
          <button onClick={() => setActiveTab("home")}>Quiz</button>
        </nav>

        <div className="content">
          {activeTab === "upload" && <AddQuestion />}

        </div>
      </div>
    </div>
  );
}

export default App;
