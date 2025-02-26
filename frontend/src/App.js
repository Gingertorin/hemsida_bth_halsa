import React, { useState } from "react";
import "./App.css";

import AddQuestion from "./AddQuestion";
import RandomQuestion from "./RandomQuestion"; // Import the new component
import MenuBar from "./MenuBar";
import FooterMenuBar from "./FooterMenuBar"; 

function App() {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <div className="App">
      <MenuBar setActiveTab={setActiveTab} />
      <div className="container">
        <div className="content">
          {activeTab === "upload" && <AddQuestion />}
          {activeTab === "random" && <RandomQuestion />} {/* Add new page */}
        </div>
      </div>
      <FooterMenuBar />
    </div>
  );
}

export default App;
