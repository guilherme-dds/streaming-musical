class PlaylistMusic:
    def __init__(self, id_playlist, id_music):
        self.id_playlist = id_playlist
        self.id_music = id_music

    def to_dict(self):
        return {
            "id_playlist": self.id_playlist,
            "id_music": self.id_music
        }