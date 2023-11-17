import json
import os
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

diretorio = 'templates'

diretorioProjeto = os.path.dirname(__file__)

#cria a pasta caso nao exista
diretorioFinal = os.path.join(diretorioProjeto, diretorio)
os.makedirs(diretorioFinal, exist_ok=True)


diretorioArquivo = os.path.join(diretorioFinal, nomeArquivo)

for coluna in colunas:
    df[coluna.nome] = None
    
    if(tipoTemplate.lower() == 'csv'):
        df.to_csv(diretorioArquivo, sep=';', index=False)
    else:
        df.to_excel(diretorioArquivo)
    
    
print(diretorioArquivo)



