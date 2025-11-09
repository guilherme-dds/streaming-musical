import sqlite3
from Models.music import Music

class MusicRepository:
    def __init__(self, db_path):
        self.db_path = db_path

    def _get_connection(self):
        # O row_factory permite acessar colunas por nome
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def get_all(self):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM music")
            rows = cursor.fetchall()
            return [Music(**row).to_dict() for row in rows]
        finally:
            conn.close()

    def get_by_id(self, music_id):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM music WHERE id = ?", (music_id,))
            row = cursor.fetchone()
            return Music(**row) if row else None
        finally:
            conn.close()

    def create(self, music):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO music (name, duration, url)
                VALUES (?, ?, ?)
            """, (music.name, music.duration, music.url))
            conn.commit()
            music.id = cursor.lastrowid
            return music
        finally:
            conn.close()

    def update(self, music_id, music_data):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE music SET name = ?, duration = ?
                WHERE id = ?
            """, (music_data['name'], music_data['duration'], music_id))
            conn.commit()
            return self.get_by_id(music_id)
        finally:
            conn.close()

    def delete(self, music_id):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM music WHERE id = ?", (music_id,))
            conn.commit()
        finally:
            conn.close()