from flask import Flask, jsonify, request
from supabase import create_client, Client
import os
from flask_cors import CORS
from dotenv import load_dotenv

from Models.music import Music
from Controllers.MusicController import MusicRepository
from Services.supabase import StorageService
from Models.artist import Artist
from Controllers.ArtistController import ArtistRepository

app = Flask(__name__)
CORS(app)
load_dotenv()  # isso carrega o .env

# --- Configuração e Instanciação ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Streaming.db")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
storage_service = StorageService(supabase, BUCKET_NAME)
music_repository = MusicRepository(DB_PATH)
artist_repository = ArtistRepository(DB_PATH)

# --- Rotas ---
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nome de arquivo inválido"}), 400

    name = request.form.get("name", file.filename) # Usa o nome do form ou o nome do arquivo

    try:
        public_url, content_type = storage_service.upload(file)

        new_music = Music(name=name, url=public_url)
        created_music = music_repository.create(new_music)

        return jsonify({
            "message": "Upload bem-sucedido!",
            "music": created_music.to_dict(),
            "content_type": content_type
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Adicionar música
@app.route('/music', methods=['POST'])
def add_music():
    music_data = request.get_json()
    try:
        # Assumindo que a URL já existe se a música for adicionada por aqui
        new_music = Music(**music_data)
        created_music = music_repository.create(new_music)
        return jsonify(created_music.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao inserir Música: {e}"}), 500
    
# Adicionar artista
@app.route('/artist', methods=['POST'])
def add_artist():
    artist_data = request.get_json()
    try:
       new_artist = Artist(**artist_data) 
       created_artist = artist_repository.create(new_artist)
       return jsonify(created_artist.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao inserir Artista: {e}"}), 500

# Consultar músicas
@app.route('/music', methods=['GET'])
def get_music():
    try:
        musics = music_repository.get_all()
        return jsonify(musics)
    except Exception as e:
        return jsonify({"error": f"Erro ao consultar as músicas: {e}"}), 500

# Consultar música por id
@app.route('/music/<int:id>', methods=['GET'])
def get_music_id(id):
    try:
        music = music_repository.get_by_id(id)
        if music is None:
            return jsonify({"error": "Música não encontrada"}), 404
        return jsonify(music.to_dict())
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Deletar música
@app.route('/music/<int:id>', methods=['DELETE'])
def delete_music(id):
    try:
        music_to_delete = music_repository.get_by_id(id)
        if not music_to_delete:
            return jsonify({"error": f"Música com id {id} não encontrada."}), 404

        # 1. Remove do storage
        storage_service.remove(music_to_delete.url)

        # 2. Remove do banco de dados
        music_repository.delete(id)
        
        return jsonify({"message": f"Música com id {id} deletada."}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao deletar música: {str(e)}"}), 500

# Editar música
@app.route('/music/<int:id>', methods=['PUT'])
def edit_music(id):
    music_data = request.get_json()
    try:
        # Verifica se a música existe antes de tentar atualizar
        if not music_repository.get_by_id(id):
            return jsonify({"error": "Música não encontrada"}), 404
            
        updated_music = music_repository.update(id, music_data)
        return jsonify(updated_music.to_dict())
    except Exception as e:
        return jsonify({"error": f"Erro ao editar música: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000, host='localhost', debug=True)