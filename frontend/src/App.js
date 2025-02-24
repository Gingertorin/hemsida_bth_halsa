import React, { useState } from "react";
import "./App.css";

import AddQuestion from "./AddQuestion"
import MenuBar from "./MenuBar"
import FooterMenuBar from "./FooterMenuBar"; // New import

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="App">
      {/* Place MenuBar at the top */}
      <MenuBar setActiveTab={setActiveTab} />
      <div className="container">
        {/* <h1>Läkemedelsberäkningar</h1> */}
        {/* Removed old nav menu */}
        <div className="content">
          {activeTab === "upload" && <AddQuestion />}
        </div>
      </div>
      <FooterMenuBar />  {/* Render footer */}
    </div>
  );
}

export default App;
