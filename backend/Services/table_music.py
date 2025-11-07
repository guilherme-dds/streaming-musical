import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Streaming.db")
conexao = sqlite3.connect(db_path)

cursor = conexao.cursor()

cursor.execute("""
        CREATE TABLE music (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            id_album INTENGER,
            id_artist INTEGER,
            id_genero INTEGER,
            name TEXT,
            duration TIME,
            url TEXT NOT NULL,
            FOREIGN KEY (id_album) REFERENCES album(id),
            FOREIGN KEY (id_artist) REFERENCES artist(id),
            FOREIGN KEY (id_genero) REFERENCES genero(id)
    );
""")

cursor.close()
print("Tabela MUSIC criada com sucesso!")