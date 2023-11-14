from io import BytesIO
import json
import sys
from types import SimpleNamespace
import pandas as pd
from pydrive.auth import GoogleAuth
from pydrive.drive import GoogleDrive
from io import StringIO

#conexao com google drive API
gauth = GoogleAuth()
GoogleAuth.DEFAULT_SETTINGS['client_config_file'] = 'src/scripts/client_secrets.json'
gauth.LocalWebserverAuth()  
drive = GoogleDrive(gauth)

#parametro informado no expressjs antes de chamar o script
jsonUploads = sys.argv[1]

#convertendo o parametro acima para objeto
uploads = json.loads(jsonUploads, object_hook=lambda d: SimpleNamespace(**d))

for upload in uploads:
    # busco no drive o arquivo pelo nome, e o drive retorna uma lista
    file_list = drive.ListFile({'q': f"title='{upload.nome}.{upload.template.extensao}'"}).GetList()

    if file_list:
        
        #o drive retorna lista, porém só pode ter 1 arquivo com o msm nome
        file_obj = file_list[0]

        # baixar o arquivo
        file_content = file_obj.GetContentString()

        try:
            # transformo em CSV caso seja CSV
            
            df = pd.read_csv(StringIO(file_content))
            #guardo o número de linhas do arquivo
            num_rows = len(df)
            upload.qtdLinhas = num_rows
        except pd.errors.ParserError:
            try:
                # transformo em excel caso seja XLSX
                df = pd.read_excel(StringIO(file_content), engine='openpyxl')
                #guardo o número de linhas do arquivo
                num_rows = len(df)
                upload.qtdLinhas = num_rows
            except pd.errors.ParserError:
                try:
                    #transformo em excel caso seja XLS
                    df = pd.read_excel(StringIO(file_content), engine='xlrd')
                    
                    #guardo o número de linhas do arquivo
                    num_rows = len(df)
                    upload.qtdLinhas = num_rows
                except Exception as e:
                    print(f"Erro: Não foi possível ler {upload.caminho}. Erro: {e}")
        except Exception as e:
            print(f"Erro: Não foi possível ler {upload.caminho}. Erro: {e}")


uploads_json = json.dumps(uploads, default=lambda o: o.__dict__)
print(uploads_json.encode('utf-8').decode('cp1252'))
