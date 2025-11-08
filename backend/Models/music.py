class Music:
    def __init__(self, name, url, id_artist=None, id_album=None, id_genero=None, duration=None, id=None):
        self.id = id
        self.id_artist = id_artist
        self.id_album = id_album
        self.id_genero = id_genero
        self.name = name
        self.duration = duration
        self.url = url

    def to_dict(self):
        return {
            "id": self.id, "id_artist": self.id_artist, "id_album": self.id_album, 
            "id_genero": self.id_genero, "name": self.name, "duration": self.duration, "url": self.url
        }