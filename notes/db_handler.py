import sqlite3
from datetime import datetime

class DBHandler:
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._create_table()

    def _create_table(self):
        """Создание таблицы записей, если она не существует"""
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            text TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        self.cursor.execute("CREATE INDEX IF NOT EXISTS idx_username ON notes (username);")
        self.conn.commit()

    def add_note(self, username: str, text: str):
        """Добавление записи в базу данных"""
        try:
            self.cursor.execute("INSERT INTO notes (username, text) VALUES (?, ?)", (username, text))
            self.conn.commit()
            return True
        except sqlite3.Error as e:
            return f"Ошибка базы данных при добавлении записи: {str(e)}"

    def get_notes_by_user(self, username: str):
        """Получение всех записей пользователя"""
        self.cursor.execute("SELECT id, text, created_at FROM notes WHERE username = ? ORDER BY created_at DESC", (username,))
        return self.cursor.fetchall()

    def delete_note(self, note_id: int):
        """Удаление записи по ID"""
        self.cursor.execute("DELETE FROM notes WHERE id = ?", (note_id,))
        self.conn.commit()
        return self.cursor.rowcount > 0

    def close(self):
        """Закрытие соединения с базой данных"""
        self.conn.close()


if __name__ == "__main__":
    db_path = "notes.db"
    db = DBHandler(db_path)

    username = "vova2"
    text = "Это моя запись!"

    result = db.add_note(username, text)
    print(f"Запись добавлена: {result}")
    notes = db.get_notes_by_user(username)
    # print(type(notes))
    print(f"Записи пользователя {username}:")
    for note in notes:
        print(note)

    db.close()
