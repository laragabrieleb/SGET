import base64
import io
import json
from types import NoneType, SimpleNamespace
import pandas as pd
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
import sys


template = sys.argv[1]
nome = sys.argv[2]
base64string = sys.argv[3]
colunas = sys.argv[4]

df = pd.DataFrame()
print(template, file=sys.stdout)
template = json.loads(template, object_hook=lambda d: SimpleNamespace(**d))
colunas = json.loads(colunas)

nomeArquivo = nome + '.' + template.extensao.lower()

with open(base64string, 'rb') as file:
    base64_data = file.read()

binary_data = base64.b64decode(base64_data)

if(template.extensao.lower() == 'csv'):
     df = pd.read_csv(io.BytesIO(binary_data), encoding='utf-8')
elif template.extensao.lower() == 'xlsx':
    # For XLSX files, you need to use the 'openpyxl' engine
    df = pd.read_excel(io.BytesIO(binary_data), engine='openpyxl')
elif template.extensao.lower() == 'xls':
    # For XLS files, you need the 'xlrd' engine
    df = pd.read_excel(io.BytesIO(binary_data), engine='xlrd')

# verifica se todos os valores da coluna são numéricos
def is_numeric_column(series, nomeColuna):
    try:
        pd.to_numeric(series)
        return True
    except ValueError:
        error_message = f"Erro: A coluna {nomeColuna} possui valores não numéricos!"
        print(error_message.encode('utf-8').decode('cp1252'), file=sys.stderr)
        sys.exit(1)
        
qtdLinhasArquivo = len(df.index) 

print(qtdLinhasArquivo, file=sys.stdout)

if(template.minLinhas is not None and qtdLinhasArquivo < template.minLinhas):
    erro = f"Erro: O arquivo possui menos de {template.minLinhas} linhas!"
    print(erro.encode('utf-8').decode('cp1252'), file=sys.stderr)
    sys.exit(1)
    
if(template.maxLinhas is not None and qtdLinhasArquivo > template.maxLinhas):
    erro = f"Erro: O arquivo possui mais de {template.maxLinhas} linhas!"
    print(erro.encode('utf-8').decode('cp1252'), file=sys.stderr)
    sys.exit(1)

for coluna in colunas:
    
    #Caso a coluna não aceite nulos e tenha alguma linha nula, retorna erro
    if (df[coluna['nome']].iloc[0:].isna().any() and coluna['nulo'] == False):
        nomeColuna = coluna['nome']
        error_message = f"Erro: A coluna {nomeColuna} possui valores vazios!"
        print(error_message.encode('utf-8').decode('cp1252'), file=sys.stderr)
        sys.exit(1)
    
    #Caso a coluna seja do tipo moeda, porcentagem ou número, verifico se todos
    #os valores são números
    if coluna['tipo'] == 'moeda' or coluna['tipo'] == 'porcentagem' or coluna['tipo'] == 'numero':
        data_column = df.loc[0:, coluna['nome']]
        is_numeric_column(data_column, coluna['nome'])

    #formato a coluna adicionando R$ e colocando como 2 casas decimais
    if coluna['tipo'] == 'moeda':
        df[f'{coluna["nome"]}'] = df.loc[0:, coluna['nome']].apply(lambda x: 'R$ {:.2f}'.format(float(x)) if not pd.isna(x) else '')
    #formato a coluna adicionando % e colocando como 2 casas decimais
    elif coluna['tipo'] == 'porcentagem':
        df[f'{coluna["nome"]}'] = df.loc[0:, coluna['nome']].apply(
        lambda x: '{:.2%}'.format(float(x) / 100) if not pd.isna(x) else '')

if template.extensao.lower() == 'csv':
    df.to_csv(nomeArquivo, sep=';', index=False)
else:
    df.to_excel(nomeArquivo)
    #CSV E XLSX - OK
    # FALTA XLS
    
gauth = GoogleAuth()
GoogleAuth.DEFAULT_SETTINGS['client_config_file'] = 'src/scripts/client_secrets.json'
gauth.LocalWebserverAuth()  
drive = GoogleDrive(gauth)

file_drive = drive.CreateFile({'title': nomeArquivo})

file_drive.SetContentFile(nomeArquivo)
file_drive.Upload()
    
file_url = file_drive['webContentLink']
    
print(file_url, file=sys.stdout)

sys.exit(0)

