import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Streaming.db")
conexao = sqlite3.connect(db_path)

cursor = conexao.cursor()

cursor.execute("""
        CREATE TABLE artist (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            image TEXT
    );
""")

cursor.close()
print("Tabela ARTIST criada com sucesso!")