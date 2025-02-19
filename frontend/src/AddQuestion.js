import { useState } from "react";
import axios from "axios";

export default function AddQuestion() {
    const [question_input, setQuestion] = useState("");
    const [answer_input, setAnswer] = useState("");
    const [answer_unit, setAnswerUnit] = useState("g"); // Default unit
    const [course_input, setCourse] = useState("");
    const [question_type, setQuestionType] = useState("");
    const [variating_values, setVariatingValues] = useState("");

    const [isSuccess, setIsSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);

    const units = ["g", "mg", "kg", "lb", "oz"];

    const handleUnitChange = (e) => {
        setAnswerUnit(e.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setResponseMessage("");
        setIsSuccess(false);
        setIsUploading(true);

        try {
            const response = await axios.post("http://localhost:5000/api/question/add", {
                question: question_input,
                course: course_input,
                question_type: question_type,
                variating_values: variating_values,
                answerFormula: answer_input,
                answerUnit: answer_unit,
            });

            setIsSuccess(response.data.success);
            setResponseMessage(response.data.message);
            if (response.data.success) {
                setQuestion("");
                setCourse("");
                setQuestionType("");
                setVariatingValues("");
                setAnswer("");
                setAnswerUnit("g");
            }
        } catch (err) {
            console.error("Error uploading question:", err);
            setIsSuccess(false);
            setResponseMessage(err.response?.data?.message || "Failed to upload data. Please try again.");
        } finally {
            setIsUploading(false);
            setTimeout(() => setResponseMessage(""), 10000);
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "90vh" }}>
            <div style={{ padding: "20px", border: "1px solid #ddd", borderRadius: "8px", width: "400px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", backgroundColor: "white" }}>
                <h2>Lägg Till Frågor</h2>
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <label>Fråga</label>
                    <input type="text" 
                        value={question_input}
                        onChange={(e) => setQuestion(e.target.value)} 
                        placeholder="Ex. Fråga %%var_1%%kg resten av frågan %%var_2%%?"
                        required />

                    <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div style={{ flex: 2 }}>
                            <label>Svar</label>
                            <input type="text" 
                                value={answer_input} 
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Ex. var_1 + var_2" 
                                required />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label>Enhet</label>
                            <select value={answer_unit} onChange={handleUnitChange} required>
                                {units.map((unit) => (
                                    <option key={unit} value={unit}>{unit}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <label>Varierande Värden</label>
                    <input type="text" 
                        value={variating_values} 
                        onChange={(e) => setVariatingValues(e.target.value)}
                        placeholder='Ex. {"var_1": [50,70], "var_2": [10,20]}'
                        required />

                    <label>Kurs</label>
                    <input type="text" 
                        value={course_input}
                        onChange={(e) => setCourse(e.target.value)}
                        placeholder="Ex. KM1423, KM1424, OM1541"
                        required />

                    <label>Frågetyp</label>
                    <input type="text" 
                        value={question_type} 
                        onChange={(e) => setQuestionType(e.target.value)}
                        placeholder="Ex. dosstyrka mängd, spädning, syr gas" 
                        required />

                    <button type="submit" disabled={isUploading}
                        style={{ 
                            padding: "10px", 
                            backgroundColor: "#273469", 
                            color: "white", 
                            border: "none", 
                            borderRadius: "5px", 
                            cursor: "pointer" }}>
                        Lägg Till Fråga
                    </button>

                    {responseMessage && (
                        <p style={{
                            color: isSuccess ? "green" : "red", 
                            marginTop: "10px" }}>
                            {responseMessage}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );
}
