import sqlite3
from Models.artist import Artist

class ArtistRepository:
    def __init__(self, db_path):
        self.db_path = db_path

    def _get_connection(self):
        # O row_factory permite acessar colunas por nome
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        return conn


    def create(self, artist):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO artist (name, image)
                VALUES (?, ?)
            """, (artist.name, artist.image))
            conn.commit()
            artist.id = cursor.lastrowid
            return artist
        finally:
            conn.close()

    def update(self, music_id, music_data):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE music SET name = ?, artist = ?, date = ?, duration = ?
                WHERE id = ?
            """, (music_data['name'], music_data['artist'], music_data['date'], music_data['duration'], music_id))
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