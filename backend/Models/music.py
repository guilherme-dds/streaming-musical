class Music:
    def __init__(self, name, url, artist=None, date=None, duration=None, id=None):
        self.id = id
        self.name = name
        self.artist = artist
        self.date = date
        self.duration = duration
        self.url = url

    def to_dict(self):
        return {
            "id": self.id, "name": self.name, "artist": self.artist,
            "date": self.date, "duration": self.duration, "url": self.url
        }