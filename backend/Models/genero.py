class Genero:
    def __init__(self, name, id=None):
        self.id = id
        self.name = name

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
        }