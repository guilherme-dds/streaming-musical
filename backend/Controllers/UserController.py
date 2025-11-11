import sqlite3
from Models.user import User

class UserRepository:
    def __init__(self, db_path):
        self.db_path = db_path

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn

    def create(self, user):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO user (name, email) VALUES (?, ?)",
                (user.name, user.email)
            )
            conn.commit()
            user.id = cursor.lastrowid
            return user

    def get_all(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_by_id(self, id):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM user WHERE id = ?", (id,))
            row = cursor.fetchone()
            return dict(row) if row else None

    def update(self, id, data):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            fields = ', '.join([f"{key} = ?" for key in data.keys()])
            values = list(data.values())
            values.append(id)
            cursor.execute(
                f"UPDATE user SET {fields} WHERE id = ?",
                tuple(values)
            )
            conn.commit()
        
        updated_user_data = self.get_by_id(id)
        if updated_user_data:
            return User(**updated_user_data)
        return None

    def delete(self, id):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM user WHERE id = ?", (id,))
            conn.commit()
            return cursor.rowcount > 0