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
        { course_code: "KM1423", course_name: "", question_types: "" },
        { course_code: "KM1424", course_name: "", question_types: "" },
        { course_code: "KM1425", course_name: "", question_types: "" },
        { course_code: "OM1541", course_name: "", question_types: "" }
    ],  // Questions can belong to multiple courses (solve with list of id's in question?)

    qtypes: [
        { id: 0, name: "IDK", right_answers: 0, wrong_answers: 0, history_json: '[]' },
        { id: 1, name: "Enhetsomvandling", right_answers: 0, wrong_answers: 0, history_json: '[]' },
        { id: 2, name: "Dosage Calculation", right_answers: 0, wrong_answers: 0, history_json: '[]' },
    ],

    medicine: [
        { id: 1, namn: "Morfin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=20131019000027", styrkor_doser: '[]' },
        { id: 2, namn: "Digoxin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=19741206000019", styrkor_doser: '[]' },
        { id: 3, namn: "Neostigmin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=19430311000013", styrkor_doser: '[]' },
        { id: 4, namn: "Heminevrin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=19680321000019", styrkor_doser: '[]' },
        { id: 5, namn: "Kåvepenin", fass_link: "https://www.fass.se/LIF/product?userType=0&nplId=19790831000024", styrkor_doser: '[]' },
        { id: 6, namn: "Novorapid", fass_link: "https://www.fass.se/LIF/result?query=Novorapid&userType=0", styrkor_doser: '[]' },
    ],

    question_data: [
    {
        question: "Läkaren har ordinerat Morfin %%dosage%% mg x %%antal%% subcutant. Tillgängligt: Morfin %%available_dose%% mg/ml. Hur många ml motsvarar en enkeldos?",
        answer_unit_id: 3,
        answer_formula: "dosage / available_dose",
        variating_values: "{'dosage' : [10,15], 'antal': [1,2,3], 'available_dose': [10], 'condition': 'dosage > 'avalible_dose'}",
        course_code: 2,
        question_type_id: 2,
    },
    {
        question: "Läkaren har oridnerat Morfin %%dosage%% mg x %%antal%% intramuskulärt. Tillgängligt preparat injektionsvätska Morfin %%available_dose%% mg/ml. Hur många ml motsvarar varje dostillfälle?",
        answer_unit_id: 3,
        answer_formula: "dosage / available_dose",
        variating_values: "{'dosage' : [10,15], 'antal': [1,2,3], 'available_dose': [10], 'condition': 'dosage > 'avalible_dose'}",
        course_code: 2,
        question_type_id: 2,
    },
    {
        question: "%%name%% ordineras %%dosage%% µg Digoxin®. Tillgängligt preparat T. Digoxin %%tablet_dose%% mg. Hur många tabletter motsvarar ordinationen?",
        answer_unit_id: 5,
        answer_formula: "dosage / tablet_dose",
        variating_values: "{'dosage': [125:500], 'tablet_dose': [0.13, 0.25]}",
        course_code: 2,
        question_type_id: 2,
    },
    {
        question: "%%name%% ordineras %%dosage%% µg Neostigmin®. Tillgängligt preparat injektionsvätska Neostigmin® %%available_dose%% mg/ml. Hur många ml motsvarar ordinationen?",
        answer_unit_id: 3,
        answer_formula: "(dosage / 100) / available_dosa",
        variating_values: "{'dosage': [0.25:1:0.1], 'available_dose': [2.5]}",
        course_code: 2,
        question_type_id: 2,
    },
    {
        question: "En patient är ordinerad %%dosage%% ml injektionsvätska insulin Novorapid® med styrkan %%available_dosa%% E/ml. Hur många E motsvarar detta?",
        answer_unit_id: 6,
        answer_formula: "dosage * available_dose",
        variating_values: "{'dosage': [0.04:0.5:0.01], 'available_dose': [100]}",
        course_code: 2,
        question_type_id: 2,
    },
    {
        question: "%%name%% ordineras %%dosage%% mg Kåvepenin/kg kroppsvikt/dos. Hon väger %%weight%% kg. Hur många mg Kåvepenin erhåller hon per dostillfälle?",
        answer_unit_id: 4,
        answer_formula: "dosage * weight",
        variating_values: "{'dosage': [12.5, 25, 50], 'weight': [50:150:1]}",
        course_code: 2,
        question_type_id: 2,
    },
    {
        question: "Din patient är ordinerad %%dosage%% ml Heminevrin %%available_dose%% mg/ml, oral lösning. Hur många milligram motsvarar detta?",
        answer_unit_id: 4,
        answer_formula: "dosage * available_dose",
        variating_values: "{'dosage': [5:20:1], 'available_dose': [50]}",
        course_code: 2,
        question_type_id: 2,
    },

    ]

}