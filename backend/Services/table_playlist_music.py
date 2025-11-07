import sqlite3
import os

db_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "Streaming.db")
conexao = sqlite3.connect(db_path)

cursor = conexao.cursor()

cursor.execute("""
    CREATE TABLE playlist_music (
        id_playlist INTEGER,
        id_music INTEGER,
        FOREIGN KEY (id_playlist) REFERENCES playlist(id),
        FOREIGN KEY (id_music) REFERENCES music(id)
    );
""")

cursor.close()
print("Tabela PLAYLIST_MUSIC criada com sucesso!")