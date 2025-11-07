import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Streaming.db")
conexao = sqlite3.connect(db_path)

cursor = conexao.cursor()

cursor.execute("""
    CREATE TABLE album (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT,
        id_artist INTEGER,
        date DATE,
        FOREIGN KEY (id_artist) REFERENCES artist(id)
    );
""")

cursor.close()
print("Tabela ALBUM criada com sucesso!")