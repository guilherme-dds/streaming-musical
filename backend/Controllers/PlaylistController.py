import sqlite3
from Models.playlist import Playlist

class PlaylistRepository:
    def __init__(self, db_path):
        self.db_path = db_path

    def _get_connection(self):
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

    def create(self, playlist):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO playlist (name, id_user) VALUES (?, ?)",
                (playlist.name, playlist.id_user)
            )
            conn.commit()
            playlist.id = cursor.lastrowid
            return playlist

    def get_all(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT p.*, u.name as user_name FROM playlist p JOIN user u ON p.id_user = u.id")
            rows = cursor.fetchall()
            return [dict(row) for row in rows]

    def get_by_id(self, id):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM playlist WHERE id = ?", (id,))
            playlist_row = cursor.fetchone()
            if not playlist_row:
                return None

            cursor.execute("""
                SELECT m.*, a.name as artist_name
                FROM music m
                JOIN playlist_music pm ON m.id = pm.id_music
                LEFT JOIN artist a ON m.id_artist = a.id
                WHERE pm.id_playlist = ?
            """, (id,))
            musics_rows = cursor.fetchall()
            
            playlist_dict = dict(playlist_row)
            playlist_dict['musics'] = [dict(row) for row in musics_rows]
            return playlist_dict

    def update(self, id, data):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "UPDATE playlist SET name = ? WHERE id = ?",
                (data['name'], id)
            )
            conn.commit()
        
        updated_playlist_data = self.get_by_id(id)
        return updated_playlist_data

    def delete(self, id):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM playlist WHERE id = ?", (id,))
            conn.commit()
            return cursor.rowcount > 0

    def add_music(self, id_playlist, id_music):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "INSERT INTO playlist_music (id_playlist, id_music) VALUES (?, ?)",
                (id_playlist, id_music)
            )
            conn.commit()

    def remove_music(self, id_playlist, id_music):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute(
                "DELETE FROM playlist_music WHERE id_playlist = ? AND id_music = ?",
                (id_playlist, id_music)
            )
            conn.commit()
            return cursor.rowcount > 0

    def get_available_musics(self, id_playlist):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                SELECT m.*, a.name as artist_name
                FROM music m
                LEFT JOIN artist a ON m.id_artist = a.id
                WHERE m.id NOT IN (
                    SELECT id_music FROM playlist_music WHERE id_playlist = ?
                )
            """, (id_playlist,))
            rows = cursor.fetchall()
            return [dict(row) for row in rows]