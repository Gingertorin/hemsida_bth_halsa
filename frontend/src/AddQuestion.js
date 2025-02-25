import { useState } from "react";
import axios from "axios";
import "./addquestion.css";
export default function AddQuestion() {
    const [question_input, setQuestion] = useState("");
    const [answer_input, setAnswer] = useState("");
    const [answer_unit, setAnswerUnit] = useState("");
    const [course_input, setCourse] = useState("");
    const [question_type, setQuestionType] = useState("");
    const [variating_values, setVariatingValues] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [responseMessage, setResponseMessage] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [isAddingUnit, setIsAddingUnit] = useState(false);
    const [isAddingCourse, setIsAddingCourse] = useState(false);
    const units = ["g", "mg", "kg", "lb", "oz"];
    const courses = ["KM1423", "KM1424", "OM1541", "OM1542", "OM1543"];
    const handleUnitChange = (e) => {
        if (e.target.value === "add enhet") {
            setIsAddingUnit(true);
            setAnswerUnit(""); // Reset value when switching to input mode
        } else {
            setIsAddingUnit(false);
            setAnswerUnit(e.target.value);
        }
    };
    const handleCourseChange = (e) => {
        if (e.target.value === "add kurs") {
            setIsAddingCourse(true);
            setCourse(""); // Clear previous selection
        } else {
            setIsAddingCourse(false);
            setCourse(e.target.value);
        }
    };
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setResponseMessage("");
        setIsSuccess(false);
        setIsUploading(true);
        // Validate variating_values (check if it's a valid JSON object)
        let parsedVariatingValues;
        try {
            parsedVariatingValues = JSON.parse(variating_values);
            if (typeof parsedVariatingValues !== "object" || Array.isArray(parsedVariatingValues)) {
                throw new Error("Invalid JSON object format");
            }
        } catch (err) {
            setIsSuccess(false);
            setResponseMessage("Invalid variating_values format. Must be a valid JSON object.");
            setIsUploading(false);
            return;
        }
        try {
            const response = await axios.post("http://localhost:5000/api/question/question/add", {
                question: question_input,
                answer_unit_id: answer_unit, // Now it can be a new unit string
                course_code: course_input, // Now it can be a new course string
                question_type_id: parseInt(question_type, 10),
                variating_values: parsedVariatingValues,
                answer_formula: answer_input,
            });
            setIsSuccess(response.data.success);
            setResponseMessage(response.data.message);
            if (response.data.success) {
                // Reset form fields
                setQuestion("");
                setCourse("");
                setQuestionType("");
                setVariatingValues("");
                setAnswer("");
                setAnswerUnit("");
                setIsAddingUnit(false);
                setIsAddingCourse(false);
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
        <div className="add-question-container" style={{ display: "flex", alignItems: "center", height: "100%", width: "100%" }}>
            {/* Instruction Section */}
            <div className="instruction-box" style={{ padding: "20px", border: "5px solid #ddd", marginRight: "80px", width: "300px", backgroundColor: "#273469" }}>
                <h3 className="instruction-title" style={{ color: "white" }}>Instruktioner</h3>
                <ul className="instruction-list" style={{ fontSize: "14px", lineHeight: "1.5", paddingLeft: "20px", color: "white" }}>
                    <li><strong>Fråga:</strong> Använd %%var_1%% och %%var_2%% för variabla värden.</li>
                    <li><strong>Svar:</strong> Skriv en formel, t.ex. <code>var_1 + var_2</code>.</li>
                    <li><strong>Varierande Värden:</strong> Ange ett JSON-objekt, ex: <code>{"var_1: [50,70] var_2: [10,20]"}</code>.</li>
                    <li><strong>Kurs:</strong> Välj en kurs eller skriv in en ny.</li>
                    <li><strong>Enhet:</strong> Välj en enhet eller lägg till en ny.</li>
                </ul>
            </div>
    
            {/* Form Section */}
            <div className="form-box" style={{ padding: "20px", border: "5px solid #ddd", borderRadius: "8px", width: "400px", boxShadow: "0px 0px 10px rgba(0,0,0,0.1)", backgroundColor: "white" }}>
                <h2 className="form-title">Lägg Till Frågor</h2>
                <form className="question-form" onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Question Input */}
                    <label className="form-label">Fråga</label>
                    <input
                        className="form-input"
                        type="text"
                        value={question_input}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Ex. Fråga %%var_1%%kg resten av frågan %%var_2%%?"
                        required
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
    
                    {/* Answer and Unit Input */}
                    <div className="answer-unit-container" style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                        <div className="answer-input" style={{ flex: 2 }}>
                            <label className="form-label">Svar</label>
                            <input
                                className="form-input"
                                type="text"
                                value={answer_input}
                                onChange={(e) => setAnswer(e.target.value)}
                                placeholder="Ex. var_1 + var_2"
                                required
                                style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                            />
                        </div>
                        <div className="unit-input" style={{ flex: 1 }}>
                            <label className="form-label">Enhet</label>
                            {!isAddingUnit ? (
                                <select
                                    className="form-select"
                                    value={answer_unit}
                                    onChange={handleUnitChange}
                                    required
                                    style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%" }}
                                >
                                    {units.map((unit) => (
                                        <option key={unit} value={unit}>{unit}</option>
                                    ))}
                                    <option value="add enhet">Lägg till enhet</option>
                                </select>
                            ) : (
                                <input
                                    className="form-input"
                                    type="text"
                                    value={answer_unit}
                                    onChange={(e) => setAnswerUnit(e.target.value)}
                                    placeholder="Skriv enhet"
                                    required
                                    style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                                />
                            )}
                        </div>
                    </div>
    
                    {/* Variating Values Input */}
                    <label className="form-label">Varierande Värden</label>
                    <input
                        className="form-input"
                        type="text"
                        value={variating_values}
                        onChange={(e) => setVariatingValues(e.target.value)}
                        placeholder='Ex. {"var_1": [50,70], "var_2": [10,20]}'
                        required
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
    
                    {/* Course Input */}
                    <label className="form-label">Kurs</label>
                    {isAddingCourse ? (
                        <input
                            className="form-input"
                            type="text"
                            value={course_input}
                            onChange={(e) => setCourse(e.target.value)}
                            placeholder="Skriv ny kurs"
                            required
                            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                        />
                    ) : (
                        <select
                            className="form-select"
                            value={course_input}
                            onChange={handleCourseChange}
                            required
                            style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc", width: "100%" }}
                        >
                            {courses.map((course) => (
                                <option key={course} value={course}>{course}</option>
                            ))}
                            <option value="add kurs">Lägg till kurs</option>
                        </select>
                    )}
    
                    {/* Question Type Input */}
                    <label className="form-label">Frågetyp</label>
                    <input
                        className="form-input"
                        type="text"
                        value={question_type}
                        onChange={(e) => setQuestionType(e.target.value)}
                        placeholder="Ex. dosstyrka mängd, spädning, syr gas"
                        required
                        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
    
                    {/* Submit Button */}
                    <button
                        className="submit-button"
                        type="submit"
                        disabled={isUploading}
                        style={{
                            padding: "10px",
                            backgroundColor: "#273469",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginTop: "10px"
                        }}
                    >
                        Lägg Till Fråga
                    </button>
    
                    {/* Response Message */}
                    {responseMessage && (
                        <p className="response-message" style={{
                            color: isSuccess ? "green" : "red",
                            marginTop: "10px",
                            textAlign: "center"
                        }}>
                            {responseMessage}
                        </p>
                    )}
                </form>
            </div>
        </div>
    );}
