from flask import Flask, jsonify, request
from supabase import create_client, Client
import os
from flask_cors import CORS
from dotenv import load_dotenv

from Services.supabase import StorageService
from Models.music import Music
from Controllers.MusicController import MusicRepository
from Models.artist import Artist
from Controllers.ArtistController import ArtistRepository
from Models.album import Album
from Controllers.AlbumController import AlbumRepository
from Models.genero import Genero
from Controllers.GeneroController import GeneroRepository
from Models.user import User
from Controllers.UserController import UserRepository
from Models.playlist import Playlist
from Controllers.PlaylistController import PlaylistRepository

app = Flask(__name__)
CORS(app)
load_dotenv()

# --- Configuração e Instanciação ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
BUCKET_NAME = os.getenv("BUCKET_NAME")

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "Streaming.db")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
storage_service = StorageService(supabase, BUCKET_NAME)
music_repository = MusicRepository(DB_PATH)
artist_repository = ArtistRepository(DB_PATH)
album_repository = AlbumRepository(DB_PATH)
genero_repository = GeneroRepository(DB_PATH)
user_repository = UserRepository(DB_PATH)
playlist_repository = PlaylistRepository(DB_PATH)

# --- Rotas Musica ---
@app.route("/upload", methods=["POST"])
def upload_file():
    if "file" not in request.files:
        return jsonify({"error": "Nenhum arquivo enviado"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "Nome de arquivo inválido"}), 400

    name = request.form.get("name", file.filename)
    id_artist = request.form.get("id_artist")
    id_album = request.form.get("id_album")
    id_genero = request.form.get("id_genero")

    try:
        public_url, content_type = storage_service.upload(file)

        new_music = Music(name=name, 
                          url=public_url, 
                          id_artist=id_artist, 
                          id_album=id_album, 
                          id_genero=id_genero)
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
        new_music = Music(**music_data)
        created_music = music_repository.create(new_music)
        return jsonify(created_music.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao inserir Música: {e}"}), 500

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
        return jsonify(music)
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
        storage_service.remove(music_to_delete['url'])

        # 2. Remove do banco de dados
        music_repository.delete(id)
        
        return jsonify({"message": f"Música com id {id} deletada."}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao deletar música: {str(e)}"}), 500

# Editar música
@app.route('/music/<int:id>', methods=['PUT'])
def edit_music(id):
    # Para PUT com FormData, usamos request.form
    music_data = {
        'name': request.form.get('name'),
        'id_artist': request.form.get('id_artist'),
        'id_album': request.form.get('id_album'),
        'id_genero': request.form.get('id_genero')
    }
    # Remove chaves com valores None para não sobrescrever com null no banco
    music_data = {k: v for k, v in music_data.items() if v is not None}
    try:
        # Verifica se a música existe antes de tentar atualizar
        if not music_repository.get_by_id(id):
            return jsonify({"error": "Música não encontrada"}), 404
            
        updated_music = music_repository.update(id, music_data)
        return jsonify(updated_music)
    except Exception as e:
        return jsonify({"error": f"Erro ao editar música: {str(e)}"}), 500
    
# --- Rotas Artista ---
    
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
    
# Consultar artistas
@app.route('/artist', methods=['GET'])
def get_artist():
    try:
        artist = artist_repository.get_all()
        return jsonify(artist)
    except Exception as e:
        return jsonify({"error": f"Erro ao consultar os artistas: {e}"}), 500
    
# Deletar artista
@app.route('/artist/<int:id>', methods=['DELETE'])
def delete_artist(id):
    try:
        artist_to_delete = artist_repository.get_by_id(id)
        if not artist_to_delete:
            return jsonify({"error": f"Artista com id {id} não encontrado."}), 404
        artist_repository.delete(id)
        
        return jsonify({"message": f"Artista com id {id} deletado."}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao deletar artista: {str(e)}"}), 500

# Editar artista
@app.route('/artist/<int:id>', methods=['PUT'])
def edit_artist(id):
    artist_data = request.get_json()
    try:
        if not artist_repository.get_by_id(id):
            return jsonify({"error": "Artista não encontrado"}), 404
            
        updated_artist = artist_repository.update(id, artist_data)
        return jsonify(updated_artist.to_dict())
    except Exception as e:
        return jsonify({"error": f"Erro ao editar artista: {str(e)}"}), 500
    
# --- Rotas Album ---
    
# Adicionar album
@app.route('/album', methods=['POST'])
def add_album():
    album_data = request.get_json()
    try:
       artist_id = album_data.get('id_artist')
       if not artist_id or not artist_repository.get_by_id(artist_id):
           return jsonify({"error": "Artista não encontrado"}), 404

       new_album = Album(**album_data) 
       created_album = album_repository.create(new_album)
       return jsonify(created_album.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao inserir Album: {e}"}), 500

# Consultar album
@app.route('/album', methods=['GET'])
def get_album():
    try:
        album = album_repository.get_all()
        return jsonify(album)
    except Exception as e:
        return jsonify({"error": f"Erro ao consultar os albuns: {e}"}), 500
    
# Deletar album
@app.route('/album/<int:id>', methods=['DELETE'])
def delete_album(id):
    try:
        album_to_delete = album_repository.get_by_id(id)
        if not album_to_delete:
            return jsonify({"error": f"Album com id {id} não encontrado."}), 404
        album_repository.delete(id)
        
        return jsonify({"message": f"Album com id {id} deletado."}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao deletar album: {str(e)}"}), 500

# Editar album
@app.route('/album/<int:id>', methods=['PUT'])
def edit_album(id):
    album_data = request.get_json()
    try:
        if not album_repository.get_by_id(id):
            return jsonify({"error": "Album não encontrado"}), 404
            
        updated_album = album_repository.update(id, album_data)
        return jsonify(updated_album.to_dict())
    except Exception as e:
        return jsonify({"error": f"Erro ao editar album: {str(e)}"}), 500
    
# --- Rotas Genero ---
    
# Adicionar genero
@app.route('/genero', methods=['POST'])
def add_genero():
    genero_data = request.get_json()
    try:
       new_genero = Genero(**genero_data) 
       created_genero = genero_repository.create(new_genero)
       return jsonify(created_genero.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao inserir Genero: {e}"}), 500

# Consultar genero
@app.route('/genero', methods=['GET'])
def get_genero():
    try:
        genero = genero_repository.get_all()
        return jsonify(genero)
    except Exception as e:
        return jsonify({"error": f"Erro ao consultar os generos: {e}"}), 500
    
# Deletar genero
@app.route('/genero/<int:id>', methods=['DELETE'])
def delete_genero(id):
    try:
        genero_to_delete = genero_repository.get_by_id(id)
        if not genero_to_delete:
            return jsonify({"error": f"Genero com id {id} não encontrado."}), 404
        genero_repository.delete(id)
        
        return jsonify({"message": f"Genero com id {id} deletado."}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao deletar genero: {str(e)}"}), 500

# Editar genero
@app.route('/genero/<int:id>', methods=['PUT'])
def edit_genero(id):
    genero_data = request.get_json()
    try:
        if not genero_repository.get_by_id(id):
            return jsonify({"error": "Genero não encontrado"}), 404
            
        updated_genero = genero_repository.update(id, genero_data)
        return jsonify(updated_genero.to_dict())
    except Exception as e:
        return jsonify({"error": f"Erro ao editar genero: {str(e)}"}), 500

# --- Rotas User ---

# Adicionar usuário
@app.route('/user', methods=['POST'])
def add_user():
    user_data = request.get_json()
    try:
       new_user = User(**user_data) 
       created_user = user_repository.create(new_user)
       return jsonify(created_user.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao inserir Usuário: {e}"}), 500

# Consultar usuários
@app.route('/user', methods=['GET'])
def get_user():
    try:
        users = user_repository.get_all()
        return jsonify(users)
    except Exception as e:
        return jsonify({"error": f"Erro ao consultar os usuários: {e}"}), 500

# Consultar usuário por id
@app.route('/user/<int:id>', methods=['GET'])
def get_user_id(id):
    try:
        user = user_repository.get_by_id(id)
        if user is None:
            return jsonify({"error": "Usuário não encontrado"}), 404
        return jsonify(user)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Deletar usuário
@app.route('/user/<int:id>', methods=['DELETE'])
def delete_user(id):
    try:
        if not user_repository.get_by_id(id):
            return jsonify({"error": f"Usuário com id {id} não encontrado."}), 404
        user_repository.delete(id)
        return jsonify({"message": f"Usuário com id {id} deletado."}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao deletar usuário: {str(e)}"}), 500

# Editar usuário
@app.route('/user/<int:id>', methods=['PUT'])
def edit_user(id):
    user_data = request.get_json()
    try:
        if not user_repository.get_by_id(id):
            return jsonify({"error": "Usuário não encontrado"}), 404
            
        updated_user = user_repository.update(id, user_data)
        return jsonify(updated_user.to_dict())
    except Exception as e:
        return jsonify({"error": f"Erro ao editar usuário: {str(e)}"}), 500

# --- Rotas Playlist ---

# Adicionar playlist
@app.route('/playlist', methods=['POST'])
def add_playlist():
    data = request.get_json()
    if not data or 'name' not in data or 'id_user' not in data:
        return jsonify({"error": "Dados incompletos"}), 400
    try:
        if not user_repository.get_by_id(data['id_user']):
            return jsonify({"error": "Usuário não encontrado"}), 404
        
        new_playlist = Playlist(name=data['name'], id_user=data['id_user'])
        created_playlist = playlist_repository.create(new_playlist)
        return jsonify(created_playlist.to_dict()), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao criar playlist: {e}"}), 500

# Consultar todas as playlists
@app.route('/playlist', methods=['GET'])
def get_playlists():
    try:
        playlists = playlist_repository.get_all()
        return jsonify(playlists)
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar playlists: {e}"}), 500

# Consultar playlist por id (com músicas)
@app.route('/playlist/<int:id>', methods=['GET'])
def get_playlist_by_id(id):
    try:
        playlist = playlist_repository.get_by_id(id)
        if playlist is None:
            return jsonify({"error": "Playlist não encontrada"}), 404
        return jsonify(playlist)
    except Exception as e:
        return jsonify({"error": f"Erro ao buscar playlist: {e}"}), 500

# Deletar playlist
@app.route('/playlist/<int:id>', methods=['DELETE'])
def delete_playlist(id):
    try:
        deleted = playlist_repository.delete(id)
        if not deleted:
            return jsonify({"error": "Playlist não encontrada"}), 404
        return jsonify({"message": "Playlist deletada com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao deletar playlist: {e}"}), 500

# Adicionar música a uma playlist
@app.route('/playlist/<int:id_playlist>/music', methods=['POST'])
def add_music_to_playlist(id_playlist):
    data = request.get_json()
    if 'id_music' not in data:
        return jsonify({"error": "ID da música é obrigatório"}), 400
    
    id_music = data['id_music']
    try:
        playlist_repository.add_music(id_playlist, id_music)
        return jsonify({"message": "Música adicionada à playlist com sucesso"}), 201
    except Exception as e:
        return jsonify({"error": f"Erro ao adicionar música: {e}"}), 500

# Remover música de uma playlist
@app.route('/playlist/<int:id_playlist>/music/<int:id_music>', methods=['DELETE'])
def remove_music_from_playlist(id_playlist, id_music):
    try:
        removed = playlist_repository.remove_music(id_playlist, id_music)
        if not removed:
            return jsonify({"error": "Música não encontrada na playlist"}), 404
        return jsonify({"message": "Música removida da playlist com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": f"Erro ao remover música: {e}"}), 500

if __name__ == '__main__':
    app.run(port=5000, host='localhost', debug=True)