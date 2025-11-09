import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Streaming.db")
conexao = sqlite3.connect(db_path)

cursor = conexao.cursor()

cursor.execute("""
    CREATE TABLE playlist (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        id_user INTEGER,
        name TEXT,
        FOREIGN KEY (id_user) REFERENCES user(id) ON DELETE CASCADE
    );
""")

cursor.close()
print("Tabela MUSIC criada com sucesso!")