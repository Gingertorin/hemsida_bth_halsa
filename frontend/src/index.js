import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App";
import Login from "./Login"; // Import Login component
import QuestionComponent from "./question"; // Import QuestionComponent
import AddQuestion from "./AddQuestion"; // Import AddQuestion component

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<App />} />
      <Route path="/question" element={<QuestionComponent />} />
      <Route path="/AddQuestion" element={<AddQuestion />} />

    </Routes>
  </Router>
);