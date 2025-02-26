const sqlite3 = require("sqlite3").verbose();
const tempDb = require("./question_temp.js"); // Import your temp data

console.log("Loaded tempDb:\n", tempDb);

// Connect to SQLite database
const db = new sqlite3.Database("question_data.db", (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the SQLite database.");
  }
});

// Enable foreign keys
db.run("PRAGMA foreign_keys = ON;");

// Helper function to insert data safely
const insertData = async (table, columns, values) => {
  return new Promise((resolve, reject) => {
    const placeholders = columns.map(() => "?").join(", ");
    const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;

    db.run(sql, values, function (err) {
      if (err) {
        console.error(`Error inserting into ${table}:`, err.message);
        reject(err);
      } else {
        resolve(this.lastID);
      }
    });
  });
};

// Function to insert units
const insertUnits = async () => {
  for (const unit of tempDb.units) {
    await insertData("units", ["id", "ascii_name", "accepted_answer"], [
      unit.id,
      unit.ascii_name,
      JSON.stringify(unit.accepted_answer),
    ]);
  }
  console.log("✅ Units inserted successfully.");
};

// Function to insert courses
const insertCourses = async () => {
  for (const course of tempDb.courses) {
    await insertData("course", ["course_code", "course_name", "question_types"], [
      course.course_code,
      course.course_name || "Unnamed Course",
      course.question_types || "[]",
    ]);
  }
  console.log("✅ Courses inserted successfully.");
};

// Function to insert question types
const insertQtypes = async () => {
  for (const qtype of tempDb.qtypes) {
    await insertData(
      "qtype",
      ["id", "name", "right_answers", "wrong_answers", "history_json"],
      [qtype.id, qtype.name, qtype.right_answers, qtype.wrong_answers, qtype.history_json]
    );
  }
  console.log("✅ Question types inserted successfully.");
};

// Function to insert medicines
const insertMedicines = async () => {
  for (const medicine of tempDb.medicine) {
    await insertData("medicine", ["id", "namn", "fass_link", "styrkor_doser"], [
      medicine.id,
      medicine.namn,
      medicine.fass_link,
      medicine.styrkor_doser || "[]",
    ]);
  }
  console.log("✅ Medicines inserted successfully.");
};

// Function to insert questions
const insertQuestions = async () => {
  for (const question of tempDb.question_data) {
    await insertData(
      "question_data",
      [
        "question",
        "answer_unit_id",
        "answer_formula",
        "variating_values",
        "course_code",
        "question_type_id",
        "hint_id",
        "wrong_answer",
        "right_answer",
      ],
      [
        question.question,
        question.answer_unit_id,
        question.answer_formula,
        JSON.stringify(question.variating_values),
        question.course_code,
        question.question_type_id,
        0, // Assuming hint_id is not yet used
        0, // Default wrong_answer count
        0, // Default right_answer count
      ]
    );
  }
  console.log("✅ Questions inserted successfully.");
};

// Run the inserts
const runInserts = async () => {
  try {
    await insertUnits();
    await insertCourses();
    await insertQtypes();
    await insertMedicines();
    await insertQuestions();
    console.log("🎉 All data inserted successfully!");
    db.close();
  } catch (error) {
    console.error("❌ Error inserting data:", error);
    db.close();
  }
};

// Execute script
runInserts();
