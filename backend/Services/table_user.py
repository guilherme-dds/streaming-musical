import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Streaming.db")
conexao = sqlite3.connect(db_path)

cursor = conexao.cursor()

cursor.execute("""
        CREATE TABLE user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            email TEXT
    );
""")

cursor.close()
print("Tabela USER criada com sucesso!")