import sqlite3

conexao = sqlite3.connect("./backend/Streaming.db")

cursor = conexao.cursor()

cursor.execute("""
        CREATE TABLE music (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            artist TEXT,
            date DATE,
            duration TIME,
            url TEXT NOT NULL
);
""")

cursor.close()
print("Tabela MUSIC criada com sucesso!")