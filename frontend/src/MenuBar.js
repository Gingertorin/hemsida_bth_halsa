import React from "react";
import "./MenuBar.css";

export default function MenuBar({ setActiveTab }) {
  return (
    <div className="menu-bar">
      <span className="menu-title">Läkemedelsberäkningar</span> {/* New title */}
      <span className="menu-separator">|</span>
      <button className="menu-item" onClick={() => setActiveTab("home")}>
        Hem
      </button>
      <span className="menu-separator">|</span>
      <button className="menu-item" onClick={() => setActiveTab("upload")}>
        Lägg Till Frågor
      </button>
      <span className="menu-separator">|</span>
      <button className="menu-item" onClick={() => setActiveTab("home")}>
        Quiz
      </button>
      <span className="menu-separator">|</span>
    </div>
  );
}
