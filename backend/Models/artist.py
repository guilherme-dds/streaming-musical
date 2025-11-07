class Artist:
    def __init__(self, name, image=None, id=None):
        self.id = id
        self.name = name
        self.image = image

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "image": self.image
        }
