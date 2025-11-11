import sqlite3
from Models.genero import Genero

class GeneroRepository:
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
            cursor.execute("SELECT * FROM genero")
            rows = cursor.fetchall()
            return [Genero(**row).to_dict() for row in rows]
        finally:
            conn.close()

    def get_by_id(self, genero_id):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM genero WHERE id = ?", (genero_id,))
            row = cursor.fetchone()
            return Genero(**row) if row else None
        finally:
            conn.close()    

    def create(self, genero):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO genero (name)
                VALUES (?)
            """, (genero.name,))
            conn.commit()
            genero.id = cursor.lastrowid
            return genero
        finally:
            conn.close()

    def update(self, genero_id, genero_data):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE genero SET name = ?
                WHERE id = ?
            """, (genero_data['name'], genero_id))
            conn.commit()
            return self.get_by_id(genero_id)
        finally:
            conn.close()

    def delete(self, genero_id):
        conn = self._get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM genero WHERE id = ?", (genero_id,))
            conn.commit()
        finally:
            conn.close()