const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.resolve(__dirname, "../db/question_data.db");
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error("Failed to connect to the database:", err.message);
    } else {
        console.log("Connected to the SQLite database.");
    }
});

db.serialize(() => {
    db.run("PRAGMA foreign_keys = ON;");

    db.run(`
        CREATE TABLE IF NOT EXISTS units (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ascii_name TEXT NOT NULL UNIQUE,
            accepted_answer TEXT NOT NULL CHECK(json_valid(accepted_answer))   -- FIX:: Should be json list
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS course (
            course_code TEXT PRIMARY KEY NOT NULL UNIQUE,
            course_name TEXT NOT NULL,
            question_types TEXT CHECK(json_valid(question_types)) -- List of qtype(id)
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS medicine (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            namn TEXT UNIQUE NOT NULL,
            fass_link TEXT NOT NULL,
            skyrkor_doser TEXT CHECK(json_valid(skyrkor_doser))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS qtype (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            right_answers INTEGER DEFAULT 0,  -- Counter for the day 
            wrong_answers INTEGER DEFAULT 0,  -- Counter for the day 
            history_json TEXT CHECK(json_valid(history_json))
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS question_data (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer_unit_id INTEGER NOT NULL,
            answer_formula TEXT NOT NULL,
            variating_values TEXT NOT NULL,
            course_code TEXT NOT NULL,
            question_type_id INTEGER NOT NULL,
            hint_id INTEGER NOT NULL,
            wrong_answer INTEGER DEFAULT 0,
            right_answer INTEGER DEFAULT 0,
            -- FOREIGN KEY (hint_id) REFERENCES hints(id),
            FOREIGN KEY (course_code) REFERENCES course(course_code),
            FOREIGN KEY (question_type_id) REFERENCES qtype(id),
            FOREIGN KEY (answer_unit_id) REFERENCES units(id)
        )
    `);

    // Create indexes if the table gets large (thousands of entries)
    // db.run("CREATE INDEX idx_course_code ON question_data(course_code);");
    // db.run("CREATE INDEX idx_question_type ON question_data(question_type_id);");
});

// -------------------------- Error Handling -----------------------------
/**
 * Handles database insert errors and returns appropriate messages.
 * @param {Error} err - The SQLite error object.
 * @returns {Object} - An error message and status code.
 */
const handleInsertError = (err) => {
    if (!err) return null;
    if (err.message.includes("FOREIGN KEY constraint failed")) {
        return { message: "Foreign key constraint failed. Check that referenced data exists.", status: 400 };
    }
    if (err.message.includes("UNIQUE constraint failed")) {
        return { message: "Duplicate entry. This record already exists.", status: 409 };
    }
    return { message: "Database error occurred.", status: 500 };
};

// -------------------------- Database Operations -----------------------------
/**
 * Adds a new record to the database.
 * @param {string} table - The table name.
 * @param {Array<string>} columns - The column names.
 * @param {Array<any>} values - The values to insert.
 * @returns {Promise<Object>} - The inserted record ID.
 */
const addRecord = (table, columns, values) => {
    return new Promise((resolve, reject) => {
        const formattedValues = values.map(value => 
            typeof value === "string" ? value.trim() : 
            typeof value === "object" ? JSON.stringify(value) : value
        );
        const placeholders = values.map(() => "?").join(", ");
        const sql = `INSERT INTO ${table} (${columns.join(", ")}) VALUES (${placeholders})`;
        db.run(sql, formattedValues, function (err) {
            const error = handleInsertError(err);
            if (error) return reject(error);
            resolve({ id: this.lastID });
        });
    });
};

/**
 * Retrieves all records from a table.
 * @param {string} table - The table name.
 * @returns {Promise<Array>} - The retrieved records.
 */
const getRecords = async (table) => {
    return new Promise((resolve, reject) => {
        db.all(`SELECT * FROM ${table}`, (err, rows) => {
            if (err) return reject({ message: "Database error", status: 500 });
            resolve(rows);
        });
    });
};

/**
 * Retrieves a specific record by ID.
 * @param {string} table - The table name.
 * @param {number} id - The record ID.
 * @returns {Promise<Object>} - The retrieved record.
 */
const getRecordById = (table, id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM ${table} WHERE id = ?`, [id], (err, row) => {
            if (err) return reject({ message: "Database error", status: 500 });
            if (!row) return reject({ message: "Record not found", status: 404 });
            resolve(row);
        });
    });
};

/**
 * Updates a record in the database.
 * @param {string} table - The table name.
 * @param {number} id - The record ID.
 * @param {Object} updates - The fields to update.
 * @returns {Promise<Object>} - The update result.
 */
const updateRecord = (table, id, updates) => {
    return new Promise((resolve, reject) => {
        const formattedUpdates = Object.keys(updates).reduce((acc, key) => {
            acc[key] = typeof updates[key] === "string" ? updates[key].trim() : 
                        typeof updates[key] === "object" ? JSON.stringify(updates[key]) : updates[key];
            return acc;
        }, {});
        
        const keys = Object.keys(formattedUpdates).map(key => `${key} = ?`).join(", ");
        const values = [...Object.values(formattedUpdates), id];
        const sql = `UPDATE ${table} SET ${keys} WHERE id = ?`;
        db.run(sql, values, function (err) {
            if (err) return reject({ message: "Database error", status: 500 });
            if (this.changes === 0) return reject({ message: "Record not found", status: 404 });
            resolve({ message: "Record updated" });
        });
    });
};

/**
 * Deletes a record from the database.
 * @param {string} table - The table name.
 * @param {number} id - The record ID.
 * @returns {Promise<Object>} - The deletion result.
 */
const deleteRecord = (table, id) => {
    return new Promise((resolve, reject) => {
        db.get(`SELECT COUNT(*) AS count FROM ${table} WHERE id = ?`, [id], (err, row) => {
            if (err) return reject({ message: "Database error", status: 500 });
            if (!row || row.count === 0) return reject({ message: "Record not found", status: 404 });
        });
        
        db.run(`DELETE FROM ${table} WHERE id = ?`, [id], function (err) {
            if (err) {
                if (err.message.includes("FOREIGN KEY constraint failed")) {
                    return reject({ message: "Cannot delete: Other records reference this entry.", status: 400 });
                }
                return reject({ message: "Database error", status: 500 });
            }
            if (this.changes === 0) return reject({ message: "Record not found", status: 404 });
            resolve({ message: "Record deleted" });
        });
    });
};

// -------------------------- Export Functions -----------------------------
module.exports = {
    addRecord,
    getRecords,
    getRecordById,
    updateRecord,
    deleteRecord,
};