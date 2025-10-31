import sqlite3

server = ''
username = ''
password = ''
database = './backend/Streaming.db'
conexao = sqlite3.connect(database)
print("Banco de dados Streaming criado com sucesso!")