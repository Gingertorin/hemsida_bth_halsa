import { useNavigate } from "react-router-dom";
import "./App.css";



function App() {
  const navigate = useNavigate();

  const handletab = (tab) => {
    if (tab === "home") {
      navigate("/home");
    }
    if (tab === "addquestion") {
      navigate("/AddQuestion");
    }
    if (tab === "question") {
      navigate("/question");
    }
  };

  return (
    <div className="App">
      <div className="container">
        {/* <h1>Läkemedelsberäkningar</h1> */}
        <nav style={{marginTop: "40px", color: "white"}}>
          <button onClick={() => handletab("home")}>Hem</button>
          <button onClick={() => handletab("addquestion")}>Lägg Till Frågor</button>
          <button onClick={() => handletab("question")}>Quiz</button>
        </nav>
      </div>
    </div>
  );
}

export default App;