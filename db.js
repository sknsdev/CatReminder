const Database = require('better-sqlite3');
const path = require('path');

// Подключение к БД
const dbPath = process.env.DB_PATH || path.join(__dirname, 'data.db');
const db = new Database(dbPath);

// Создание таблицы пользователей
db.exec(`
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        username TEXT,
        is_notify INTEGER DEFAULT 1,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS daily_checks (
        date TEXT PRIMARY KEY,
        is_fed INTEGER DEFAULT 0,
        is_played INTEGER DEFAULT 0,
        is_cleaned INTEGER DEFAULT 0
    );
`);

// Получить пользователя
const getUser = (id) => {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id);
};

// Создать пользователя
const createUser = (id, username) => {
    const stmt = db.prepare('INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)');
    stmt.run(id, username);
};

// Получить статус на сегодня
const getDailyStatus = (date) => {
    const stmt = db.prepare('SELECT * FROM daily_checks WHERE date = ?');
    let status = stmt.get(date);
    if (!status) {
        db.prepare('INSERT INTO daily_checks (date) VALUES (?)').run(date);
        status = { date, is_fed: 0, is_played: 0, is_cleaned: 0 };
    }
    return status;
};

// Отметить задачу
const markTask = (date, task) => {
    // task: 'is_fed', 'is_played', 'is_cleaned'
    // Используем безопасный список полей, чтобы избежать SQL инъекций
    const allowedTasks = ['is_fed', 'is_played', 'is_cleaned'];
    if (!allowedTasks.includes(task)) return;

    // Сначала убедимся, что запись существует
    getDailyStatus(date);
    
    // Обновляем
    const stmt = db.prepare(`UPDATE daily_checks SET ${task} = 1 WHERE date = ?`);
    stmt.run(date);
};

module.exports = {
    getUser,
    createUser,
    getDailyStatus,
    markTask
};
