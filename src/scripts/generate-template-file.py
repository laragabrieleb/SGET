import json
from types import SimpleNamespace
import pandas as pd
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import sys


jsonColunas = sys.argv[1]
nomeTemplate = sys.argv[2]
tipoTemplate = sys.argv[3]

df = pd.DataFrame()

colunas = json.loads(jsonColunas, object_hook=lambda d: SimpleNamespace(**d))

nomeArquivo = nomeTemplate + '.' + tipoTemplate.lower()

for coluna in colunas:
    df[coluna.nome] = None
    
    if(tipoTemplate.lower() == 'csv'):
        df.to_csv(nomeArquivo, sep=';', index=False)
    else:
        df.to_excel(nomeArquivo)
    #CSV E XLSX - OK
    # TESTE XLS
    
gauth = GoogleAuth()
GoogleAuth.DEFAULT_SETTINGS['client_config_file'] = 'src/scripts/client_secrets.json'
gauth.LocalWebserverAuth()  
drive = GoogleDrive(gauth)

file_drive = drive.CreateFile({'title': nomeArquivo})

file_drive.SetContentFile(nomeArquivo)
file_drive.Upload()
    
file_url = file_drive['webContentLink']
    
print(file_url)



