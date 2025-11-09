import sqlite3
from Models.album import Album

class AlbumRepository:
    def __init__(self, db_path):
        self.db_path = db_path

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn
    
    def get_all(self):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM album")
            rows = cursor.fetchall()
            return [Album(**row).to_dict() for row in rows]
        finally:
            conn.close()

    def get_by_id(self, album_id):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM album WHERE id = ?", (album_id,))
            row = cursor.fetchone()
            return Album(**row) if row else None
        finally:
            conn.close()    

    def create(self, album):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO album (name, id_artist, date)
                VALUES (?, ?, ?)
            """, (album.name, album.id_artist, album.date))
            conn.commit()
            album.id = cursor.lastrowid
            return album
        finally:
            conn.close()

    def update(self, album_id, album_data):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE album SET name = ?, id_artist = ?, date = ?
                WHERE id = ?
            """, (album_data['name'], album_data['id_artist'], album_data['date'], album_id))
            conn.commit()
            return self.get_by_id(album_id)
        finally:
            conn.close()

    def delete(self, album_id):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM album WHERE id = ?", (album_id,))
            conn.commit()
        finally:
            conn.close()