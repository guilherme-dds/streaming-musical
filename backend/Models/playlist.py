class Playlist:
    def __init__(self, name, id_user, id=None):
        self.id = id
        self.name = name
        self.id_user = id_user

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "id_user": self.id_user
        }