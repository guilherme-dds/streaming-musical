from flask import Flask, jsonify, request
from supabase import create_client, Client
import os
import sqlite3
from flask_cors import CORS
from dotenv import load_dotenv
import mimetypes
from urllib.parse import urlparse, unquote

app = Flask(__name__)
CORS(app)

def conectaBD():
    conexao = sqlite3.connect("./backend/Streaming.db")
    return conexao

load_dotenv()  # isso carrega o .env

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

@app.route("/upload", methods=["POST"])
def upload_file():
    conexao = conectaBD()
    cursor = conexao.cursor()

    file = request.files["file"]
    name = request.form.get("name")

    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    if file.filename == "":
        return jsonify({"error": "Nome de arquivo inválido"}), 400

    file_bytes = file.read()
    content_type, _ = mimetypes.guess_type(file.filename)
    if not content_type:
        content_type = "application/octet-stream"

    try:
        # Envia com o tipo MIME correto
        supabase.storage.from_(BUCKET_NAME).upload(
            path=file.filename,
            file=file_bytes,
            file_options={"content-type": content_type},
        )

        public_url = supabase.storage.from_(BUCKET_NAME).get_public_url(file.filename)

        cursor.execute("""
                       INSERT INTO music (name, url) VALUES (?, ?)
                """, (
                    name,
                    public_url,
                ))
        conexao.commit()

        return jsonify({"message": "Upload bem-sucedido!", "public_url": public_url, "content_type": content_type})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Adicionar música
@app.route('/music', methods=['POST'])
def add_music():
    conexao = conectaBD()
    cursor = conexao.cursor()
    music = request.get_json()

    try:
        cursor.execute("""
            INSERT INTO music (id, name, artist, date, duration)
            VALUES (?, ?, ?, ?, ?)
        """, (
            music.get('id'),
            music.get('name'),
            music.get('artist'),
            music.get('date'),
            music.get('duration')
        )) 
        conexao.commit()
        print("Música inserida com sucesso!")
        return jsonify(music)
    except sqlite3.Error as e:
        print(f"Erro ao inserir Música: {e}")
    finally:
        conexao.close()

# Consultar músicas
@app.route('/music', methods=['GET'])
def get_music():
    conexao = conectaBD()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.cursor()
    try:
        cursor.execute("SELECT * FROM music")
        rows = cursor.fetchall()
        musics = [dict(row) for row in rows] 
        conexao.commit()
        print("Consulta realizada com sucesso!")
        return jsonify(musics)
    except sqlite3.Error as e:
        print(f"Erro ao consultar as músicas: {e}")
    finally:
        conexao.close()

# Consultar música por id
@app.route('/music/<int:id>', methods=['GET'])
def get_music_id(id):
    conexao = conectaBD()
    conexao.row_factory = sqlite3.Row
    cursor = conexao.cursor()

    try:
        cursor.execute("SELECT * FROM music WHERE id = ?", (id,))
        music = cursor.fetchone()

        if music is None:
            return jsonify({"error": "Música não encontrada"}), 404

        return jsonify(dict(music))
    except sqlite3.Error as e:
        print(f"Erro ao consultar a música: {e}")
        return jsonify({"error": str(e)}), 500
    finally:
        conexao.close()

# Deletar música
@app.route('/music/<int:id>', methods=['DELETE'])
def delete_music(id):
    conexao = conectaBD()
    cursor = conexao.cursor()
    try:
        cursor.execute("SELECT url FROM music WHERE id = ?", (id,))
        result_row = cursor.fetchone()
        if not result_row:
            return jsonify({"error": f"Música com id {id} não encontrada."}), 404

        url = result_row[0]
        parsed = urlparse(url)
        path_parts = parsed.path.split("/")

        try:
            object_index = path_parts.index("object")
        except ValueError:
            return jsonify({"error": "URL do Supabase mal formatada, 'object' não encontrado."}), 500

        if len(path_parts) <= object_index + 3:
            return jsonify({"error": f"URL inválida ou sem caminho de arquivo: {url}"}), 500

        bucket_name = path_parts[object_index + 2]          # Bucket = 'Music'
        file_path_segments = path_parts[object_index + 3:]  # Caminho dentro do bucket
        file_path = unquote("/".join(file_path_segments))   # Decodifica

        print("Bucket:", bucket_name)
        print("Caminho do arquivo:", file_path)

        result = supabase.storage.from_(bucket_name).remove([file_path])
        print("Resultado da remoção:", result)

        # 4. Deletar a entrada da música do banco de dados SQLite
        cursor.execute("""
            DELETE FROM music WHERE id = ?
        """, (
            id,
        ))
        conexao.commit()
        print("Música deletada do banco de dados com sucesso!")
        return jsonify({"message": f"Música com id {id} deletada."}), 200
    except Exception as e: # Captura erros gerais, incluindo problemas com Supabase ou parsing da URL
        print(f"Erro ao deletar Música: {e}")
        return jsonify({"error": f"Erro ao deletar música: {str(e)}"}), 500
    finally:
        conexao.close()

# Editar música
@app.route('/music/<int:id>', methods=['PUT'])
def edit_music(id):
    conexao = conectaBD()
    cursor = conexao.cursor()
    music = request.get_json()

    try:
        cursor.execute("""
            ALTER TABLE music FROM ? WHERE id = ?
        """, (
            music.get('id'),
        ))
    except:
        return


app.run(port=5000, host='localhost', debug=True)