class Album:
    def __init__(self, name, id_artist=None, date=None,  id=None):
        self.id = id
        self.id_artist = id_artist
        self.name = name
        self.date = date

    def to_dict(self):
        return {
            "id": self.id, "id_artist": self.id_artist, "name": self.name, "date": self.date
        }