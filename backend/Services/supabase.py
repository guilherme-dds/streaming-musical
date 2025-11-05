import mimetypes
from urllib.parse import urlparse, unquote

class StorageService:
    def __init__(self, supabase_client, bucket_name):
        self.supabase = supabase_client
        self.bucket_name = bucket_name

    def upload(self, file_storage):
        file_bytes = file_storage.read()
        content_type, _ = mimetypes.guess_type(file_storage.filename)
        if not content_type:
            content_type = "application/octet-stream"

        # Envia com o tipo MIME correto
        self.supabase.storage.from_(self.bucket_name).upload(
            path=file_storage.filename,
            file=file_bytes,
            file_options={"content-type": content_type},
        )

        public_url = self.supabase.storage.from_(self.bucket_name).get_public_url(file_storage.filename)
        return public_url, content_type

    def remove(self, file_url):
        parsed = urlparse(file_url)
        path_parts = parsed.path.split("/")

        try:
            object_index = path_parts.index("object")
            bucket_name = path_parts[object_index + 2]
            file_path_segments = path_parts[object_index + 3:]
            file_path = unquote("/".join(file_path_segments))

            return self.supabase.storage.from_(bucket_name).remove([file_path])
        except (ValueError, IndexError) as e:
            raise Exception(f"URL do Supabase mal formatada ou inválida: {file_url}") from e