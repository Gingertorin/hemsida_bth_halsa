import React, { useState } from "react";
import "./App.css";

import AddQuestion from "./AddQuestion"
import Login from "./Login"




function App() {
  const [activeTab, setActiveTab] = useState("home");


  return (
    <div className="App">
      <div className="container">
        <h1>Läkemedelsberäkningar</h1>
        <nav>
          <button onClick={() => setActiveTab("home")}>Home</button>
          <button onClick={() => setActiveTab("login")}>Login</button>
          <button onClick={() => setActiveTab("upload")}>Upload Question</button>
        </nav>
        <div>
          {activeTab === "upload" && <AddQuestion />}
          {activeTab === "login" && <Login />}

        </div>
      </div>
    </div>
  );
}

export default App;
