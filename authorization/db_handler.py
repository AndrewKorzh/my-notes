import sqlite3

class DBHandler:
    def __init__(self, db_path):
        self.conn = sqlite3.connect(db_path)
        self.cursor = self.conn.cursor()
        self._create_table()

    def _create_table(self):
        # id INTEGER PRIMARY KEY AUTOINCREMENT - потом можно добавить и привязываться к нему, чтобы имя можно было менять
        self.cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        )
        """)
        self.conn.commit()

    def add_user(self, username, password_hash):
        try:
            if self.user_exists(username):
                return f"Пользователь с именем '{username}' уже существует."
            self.cursor.execute("INSERT INTO users (username, password_hash) VALUES (?, ?)", 
                                (username, password_hash))
            self.conn.commit()

            return True
        except sqlite3.IntegrityError:
            return f"Ошибка базы данных при добавлении пользователя '{username}'."
        except Exception as e:
            return f"Произошла ошибка при добавлении пользователя: {str(e)}"

    def user_exists(self, username) -> bool:
        self.cursor.execute("SELECT 1 FROM users WHERE username = ?", (username,))
        return self.cursor.fetchone() is not None

    def get_password(self, username) -> str | None:
        self.cursor.execute("SELECT password_hash FROM users WHERE username = ?", (username,))
        result = self.cursor.fetchone()
        if result is None:
            return None
        return result[0]

    def close(self):
        self.conn.close()


if __name__ == "__main__":
    db_path = "user_auth.db"
    hash_example = "hash-example"
    username = "john_doe"

    db = DBHandler(db_path=db_path)    
    try_to_add = db.add_user(username, hash_example)
    is_exists = db.user_exists("john_doe")
    password = db.get_password("john_doe")

    print(f"Пользователь {username} добавлен: {try_to_add}")
    print(f"Пользователь {username} существует: {is_exists}")
    print(f"Password: {password}")

    db.close()
