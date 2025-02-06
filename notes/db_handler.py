import sqlite3
from datetime import datetime

class DBHandler:
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._create_table()

    # username TEXT NOT NULL,
    def _create_table(self):
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS notes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            text TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """)
        self.cursor.execute("CREATE INDEX IF NOT EXISTS idx_username ON notes (username);")
        self.conn.commit()

    def add_note(self, username: str, text: str):
        try:
            self.cursor.execute("INSERT INTO notes (username, text) VALUES (?, ?)", (username, text))
            self.conn.commit()
            last_id = self.cursor.lastrowid
            self.cursor.execute("SELECT text, created_at FROM notes WHERE id = ?", (last_id,))
            record = self.cursor.fetchone()
            return {"id": last_id, "text": record[0], "created_at": record[1]}
        except sqlite3.Error as e:
            return f"Ошибка базы данных при добавлении записи: {str(e)}"

    def get_notes_by_user(self, username: str):
        self.cursor.execute("SELECT id, text, created_at FROM notes WHERE username = ? ORDER BY created_at DESC", (username,))
        notes = self.cursor.fetchall()
        
        return [
            {"id": note[0], "text": note[1], "created_at": note[2]}
            for note in notes
        ]

    def delete_notes(self, username: str, note_ids: list[int]):
        if not note_ids:
            return False

        placeholders = ", ".join(["?"] * len(note_ids))
        query = f"SELECT id FROM notes WHERE id IN ({placeholders}) AND username = ?"
        
        self.cursor.execute(query, note_ids + [username])
        existing_notes = {row[0] for row in self.cursor.fetchall()}

        if not existing_notes or len(existing_notes) != len(note_ids):
            return False

        delete_query = f"DELETE FROM notes WHERE id IN ({placeholders}) AND username = ?"
        self.cursor.execute(delete_query, note_ids + [username])
        self.conn.commit()

        return self.cursor.rowcount > 0

    def close(self):
        self.conn.close()


if __name__ == "__main__":
    db_path = "notes.db"
    db = DBHandler(db_path)

    username = "vova2"
    text = "Это моя запись!"

    result = db.add_note(username, text)
    print(f"Запись добавлена: {result}")
    notes = db.get_notes_by_user(username)
    print(f"Записи пользователя {username}:")
    for note in notes:
        print(note)

    db.delete_notes(username=username, note_ids=[n["id"] for n in notes])

    print(f"Записи пользователя {username}:")
    notes = db.get_notes_by_user(username)
    for note in notes:
        print(note)

    db.close()
