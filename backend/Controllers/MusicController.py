import sqlite3
from Models.music import Music

class MusicRepository:
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
            cursor.execute("""
                SELECT 
                    m.*, 
                    a.name as artist_name 
                FROM music m
                LEFT JOIN artist a ON m.id_artist = a.id
            """)
            rows = cursor.fetchall()
            return [dict(row) for row in rows]
        finally:
            conn.close()

    def get_by_id(self, music_id):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT 
                    m.*, 
                    a.name as artist_name 
                FROM music m
                LEFT JOIN artist a ON m.id_artist = a.id
                WHERE m.id = ?
            """, (music_id,))
            row = cursor.fetchone()
            return dict(row) if row else None
        finally:
            conn.close()

    def create(self, music):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO music (name, url, id_artist, id_album, id_genero)
                VALUES (?, ?, ?, ?, ?)
            """, (music.name, music.url, music.id_artist, music.id_album, music.id_genero))
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
                UPDATE music SET name = ?, id_artist = ?, id_album = ?, id_genero = ?
                WHERE id = ?
            """, (music_data.get('name'), music_data.get('id_artist'), music_data.get('id_album'), music_data.get('id_genero'), music_id))
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