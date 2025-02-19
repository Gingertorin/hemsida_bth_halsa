import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./login.css"; // Import CSS styles

const Login = ({ onLogin }) => {
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = response.json();
      // if (response.ok) {
      if (2==2) {
        navigate("/app"); // Navigate after successful login
      } else {
        alert(data.message || "Invalid credentials"); // Handle errors
      }

    } catch (error) {
      console.error("Error:", error);
    }
  };


  return (
    <div className={`login-page login-background`}>
      <div className={`container ${isSignUp ? "right-panel-active" : ""}`} id="container" style={{
        backgroundColor: "#fff",
        borderRadius: "10px",
        boxShadow: "0 14px 28px rgba(0, 0, 0, 0.25), 0 10px 10px rgba(0, 0, 0, 0.22)",
        position: "relative",
        overflow: "hidden",
        width: "768px",
        maxWidth: "100%",
        minHeight: "480px"
      }}>
        {/* Signup Form */}
        <div className="form-container sign-up-container">
          <form>
            <h1>Skappa konto</h1>
            <input type="text" placeholder="Namn" />
            <input type="text" placeholder="Användernamn" />
            <input type="password" placeholder="Lösningsord" />
            <button>Registrera</button>
          </form>
        </div>

        {/* Login Form */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleLogin}>
            <h1>Logga In</h1>
            <input
              type="text"
              placeholder="Användernamn"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <input
              type="password"
              placeholder="Lösningsord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit">Logga In</button>
          </form>
        </div>

        {/* Overlay for Animation */}
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h1>Välkomen tillbacka!</h1>
              <p>Logga in för att komma igång</p>
              <button className="ghost" onClick={() => setIsSignUp(false)}>Logga In</button>
            </div>
            <div className="overlay-panel overlay-right">
              <h1>Hej, studenter!</h1>
              <p>Använd ditt info för att registrera</p>
              <button className="ghost" onClick={() => setIsSignUp(true)}>Registrera</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
