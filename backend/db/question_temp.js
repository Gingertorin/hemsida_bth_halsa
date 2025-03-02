const tempDb = {
    units: [
        { id: 1, ascii_name: "%%second_prefix%%g", accepted_answer: ["%%second_prefix%%g"] },
        { id: 2, ascii_name: "%%second_prefix%%l", accepted_answer: ["%%second_prefix%%l"] },
        { id: 3, ascii_name: "ml", accepted_answer: ["ml", "ML", "mL", "Ml"] },
        { id: 4, ascii_name: "mg", accepted_answer: ["mg", "MG", "mG", "Mg"] },
        { id: 5, ascii_name: "tablett", accepted_answer: ["tablett", "tabletter"] },
        { id: 6, ascii_name: "E", accepted_answer: ["E", "e"] },
    ],

    courses: [
        { course_code: "KM1423", course_name: "KM1423", question_types: '["IDK"]' },
        { course_code: "KM1424", course_name: "KM1424", question_types: '["Enhetsomvandling", "Dosage Calculation"]' },
        { course_code: "KM1425", course_name: "KM1425", question_types: '["IDK"]' },
        { course_code: "OM1541", course_name: "OM1541", question_types: '["IDK"]' }
    ],

    qtypes: [
        { id: 0, name: "IDK", right_answers: 0, wrong_answers: 0, history_json: "[]" },
        { id: 1, name: "Enhetsomvandling", right_answers: 0, wrong_answers: 0, history_json: "[]" },
        { id: 2, name: "Dosage Calculation", right_answers: 0, wrong_answers: 0, history_json: "[]" },
    ],

    medicine: [
        { id: 1, namn: "Morfin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=20131019000027", styrkor_doser: "{\"dosage\": [15,10], \"available_dose\": [10]}" },
        { id: 2, namn: "Digoxin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=19741206000019", styrkor_doser: "{\"tablet_dose\": [0.25, 0.13]}" },
        { id: 3, namn: "Neostigmin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=19430311000013", styrkor_doser: "{}" },
        { id: 4, namn: "Heminevrin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=19680321000019", styrkor_doser: "{\"dosage\": [5,20,1], \"available_dose\": [50]}" },
        { id: 5, namn: "Kåvepenin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=19790831000024", styrkor_doser: "{\"dosage\": [12.5, 25, 50]}" },
        { id: 6, namn: "Novorapid", fass_link: "https://www.fass.se/LIF/result?query=Novorapid&userType=0", styrkor_doser: "{\"dosage\": [0.04, 0.5, 0.01], \"available_dose\": [100]}" },
    ],

    question_data: [
        {
            question: "Läkaren har ordinerat %%medicine%% %%dosage%% mg x %%antal%% subcutant. Tillgängligt: Morfin %%available_dose%% mg/ml. Hur många ml motsvarar en enkeldos?",
            answer_unit_id: 3,
            answer_formula: "dosage / available_dose",
            variating_values: "{\"medicine\": [\"Morfin\"], \"antal\": [1,3], \"condition\": \"dosage >= available_dose\"}",
            course_code: "KM1424",
            question_type_id: 2,
        },
        {
            question: "Läkaren har oridnerat %%medicine%% %%dosage%% mg x %%antal%% intramuskulärt. Tillgängligt preparat injektionsvätska Morfin %%available_dose%% mg/ml. Hur många ml motsvarar varje dostillfälle?",
            answer_unit_id: 3,
            answer_formula: "dosage / available_dose",
            variating_values: "{\"medicine\": [\"Morfin\"], \"antal\": [1,3], \"available_dose\": [10], \"condition\": \"dosage >= available_dose\"}",
            course_code: "KM1424",
            question_type_id: 2,
        },
        {
            question: "En patient är ordinerad %%dosage%% ml injektionsvätska insulin Novorapid med styrkan %%available_dose%% E/ml. Hur många E motsvarar detta?",
            answer_unit_id: 6,
            answer_formula: "dosage * available_dose",
            variating_values: "{\"medicine\": [\"Novorapid\"]}",
            course_code: "KM1424",
            question_type_id: 2,
        },
        {
            question: "%%name%% ordineras %%dosage%% mg %%medicine%%/kg kroppsvikt/dos. Hon väger %%weight%% kg. Hur många mg Kåvepenin erhåller hon per dostillfälle?",
            answer_unit_id: 4,
            answer_formula: "dosage * weight",
            variating_values: "{\"medicine\": [\"Kåvepenin\"], \"weight\": [50,150,1]}",
            course_code: "KM1424",
            question_type_id: 2,
        },
        {
            question: "Din patient är ordinerad %%dosage%% ml %%medicine%% %%available_dose%% mg/ml, oral lösning. Hur många milligram motsvarar detta?",
            answer_unit_id: 4,
            answer_formula: "dosage * available_dose",
            variating_values: "{\"medicine\": [\"Heminevrin\"]}",
            course_code: "KM1424",
            question_type_id: 2,
        }
    ]
};

// Export the Variable
module.exports = tempDb;
