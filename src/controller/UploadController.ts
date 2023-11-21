import { AppDataSource } from "../data-source";
import { Templates, descricaoTemplateEhValida, nomeTemplateEhValido } from "../entity/Templates";
import { NextFunction, Request, Response } from "express"
import { Usuarios } from "../entity/Usuarios";
import { Uploads } from "../entity/Uploads";
import { Colunas } from "../entity/Colunas";
import { Categorias } from "../entity/Categorias";
import * as fs from 'fs';
import * as path from 'path';

export class UploadsController {
    private uploadsRepository = AppDataSource.getRepository(Uploads);
    private templatesRepository = AppDataSource.getRepository(Templates);
    private usuarioRepository = AppDataSource.getRepository(Usuarios);
    private colunasRepository = AppDataSource.getRepository(Colunas);
    private categoriasRepository = AppDataSource.getRepository(Categorias);
    //lógica para pegar apenas templates ativas
    //mostrar no select

    async listarArquivos(request: Request, response: Response, next: NextFunction) {
        let arquivos = await this.uploadsRepository
        .createQueryBuilder('uploads')
        .leftJoinAndSelect('uploads.categoria', 'categoria')
        .where('uploads.categoriaId = categoria.id')
        .leftJoinAndSelect('uploads.template', 'template')
        .where('uploads.templateId = template.id')
        .getMany();

        let arquivosComBase64: any[] = [];

        arquivos.forEach(item => {
            let novoArquivo = item as any;

            novoArquivo.caminho = novoArquivo.caminho.replace(/\\/g, '\\\\')
            // Ler o arquivo e converter para base64
            
                let arquivoBuffer = fs.readFileSync(novoArquivo.caminho);
                let arquivoBase64 = arquivoBuffer.toString('base64');
        
                // Armazenar a representação base64 no campo base64 de novaTemplate
                novoArquivo.base64 = arquivoBase64;

                //armazeno a template com base64 no array 
                arquivosComBase64.push(novoArquivo);
            
        });

        return response.status(200).send({
            mensagem: 'Uploads obtidos com sucesso.',
            status: 200,
            uploads: arquivosComBase64
         });
    }

    async listarCategorias(request: Request, response: Response, next: NextFunction) {
        let categorias = await this.categoriasRepository.find();

        return response.status(200).send({
            mensagem: 'Categorias obtidas com sucesso.',
            status: 200,
            categorias: categorias
         });
    }

    async listarArquivosParaDashboard(request: Request, response: Response, next: NextFunction) {
        let uploads = await this.uploadsRepository
              .createQueryBuilder('uploads')
              .leftJoinAndSelect('uploads.template', 'template')
              .where('uploads.templateId = template.id')
              .getMany();

        console.log(uploads);

        const spawn = require('child_process').spawn;
        const path = require('path'); 

        //caminho para o script em py
        const caminhoScript = path.join(__dirname, '../scripts/get-file-lines.py');

            //spawn para iniciar um novo processo Python
            let jsonUploads = JSON.stringify(uploads);
            const script = spawn('python', [caminhoScript, jsonUploads ]);


            script.stdout.on('data', async (data) => {
                //uploads com a propriedade qtdLinhas preenchida,
                //o python retorna como JSON então converto de volta pra objeto

                //filtrar apenas o json na mensagem de retorno
                const regex = /\[\{.*?\}\]/s;
                let result = data.toString();
                const match = result.match(regex);

                if (match) {
                    const jsonString = match[0];
                    uploads = JSON.parse(jsonString);
                } 
              });

            script.stderr.on('data', (data) => {
              console.log(`erro: ${data}`);
            });

            script.on('close', async (code) => {
                console.log(`python finalizou com código:  ${code}`);
                
                let arquivosComBase64: any[] = [];

                uploads.forEach(item => {
                    let novoArquivo = item as any;

                    novoArquivo.caminho = novoArquivo.caminho.replace(/\\/g, '\\\\')
                    // Ler o arquivo e converter para base64
            
                    let arquivoBuffer = fs.readFileSync(novoArquivo.caminho);
                    let arquivoBase64 = arquivoBuffer.toString('base64');
        
                    // Armazenar a representação base64 no campo base64 de novaTemplate
                    novoArquivo.base64 = arquivoBase64;

                    //armazeno a template com base64 no array 
                    arquivosComBase64.push(novoArquivo);
            
                });

                return response.status(200).send({
                    mensagem: 'Uploads obtidos com sucesso.',
                    status: 200,
                    uploads: arquivosComBase64
                });
            });
    }

    async obterRelatorioDashboard(request: Request, response: Response, next: NextFunction) {

        const spawn = require('child_process').spawn;
        const path = require('path'); 

        //caminho para o script em py
        let relatorio:any;

        const caminhoScript = path.join(__dirname, '../scripts/obter-dados-dashboard.py');

            //spawn para iniciar um novo processo Python
            const script = spawn('python', [caminhoScript ]);


            script.stdout.on('data', async (data) => {
                //script retorna qtd de arquivos e templates gerados por mes
                console.log(`RELATÓRIO:${data}`)

                    relatorio = JSON.parse(data);
              });

            script.stderr.on('data', (data) => {
              console.log(`erro: ${data}`);
            });

            script.on('close', async (code) => {
                console.log(`python finalizou com código:  ${code}`);
                
                return response.status(200).send({
                    mensagem: 'Uploads obtidos com sucesso.',
                    status: 200,
                    uploads: relatorio
                });
            });
    }

    async listarArquivosUsuario(request: Request, response: Response, next: NextFunction){
        //pegar id do usuário logado
        //vem pela url quando é get = em obter template
        const idUsuario = request.query.id;

        let arquivosDoUsuario = await this.uploadsRepository
        .createQueryBuilder('uploads')
        .leftJoinAndSelect('uploads.categoria', 'categoria')
        .where('uploads.categoriaId = categoria.id')
        .where(`uploads.usuarioId = ${idUsuario}`)
        .leftJoinAndSelect('uploads.template', 'template')
        .where('uploads.templateId = template.id')
        .getMany();
        

        let arquivosDoUsuarioComBase64: any[] = [];

        arquivosDoUsuario.forEach(item => {
            let novoArquivo = item as any;

            novoArquivo.caminho = novoArquivo.caminho.replace(/\\/g, '\\\\')
            // Ler o arquivo e converter para base64
            
                let arquivoBuffer = fs.readFileSync(novoArquivo.caminho);
                let arquivoBase64 = arquivoBuffer.toString('base64');
        
                // Armazenar a representação base64 no campo base64 de novaTemplate
                novoArquivo.base64 = arquivoBase64;

                //armazeno a template com base64 no array 
                arquivosDoUsuarioComBase64.push(novoArquivo);
            
        });

          return response.status(200).json({
            mensagem: 'Arquivos encontrados com sucesso.', 
            uploads: arquivosDoUsuarioComBase64,

            status: 200 
           });
   
        } catch (error) {
        
            console.error('Erro ao encontrar arquivos.', error);
        }

    async alterarStatusArquivo(request: Request, response: Response, next: NextFunction) {
        try{

        const { aprovado, idArquivo } = request.body;
        const arquivo = await this.uploadsRepository.findOneBy({
            id: idArquivo
        });

        if (!arquivo) {
            return response.status(400).send({
                mensagem: 'Arquivo inexistente!',
                status: 400
            });
        }

        if(aprovado)
            arquivo.status = 'aprovado';
        else
            arquivo.status = 'negado';
        
        await this.uploadsRepository.save(arquivo);

        return response.status(200).send({
            mensagem: 'Status do arquivo atualizado com sucesso!',
            status: 200
        });

    }
    catch (error) {
        return response.status(500).send({
            mensagem: 'Erro ao alterar o status do arquivo, tente novamente mais tarde.',
            status: 500
         });
    }
}

    async listarTemplatesAtivas(request: Request, response: Response, next: NextFunction) {

        let templates = await this.templatesRepository.findBy({
            situacao: true
        });

        let templatesComBase64: any[] = [];

        templates.forEach(item => {
            let novaTemplate = item as any;

            novaTemplate.caminho = novaTemplate.caminho.replace(/\\/g, '\\\\')
            // Ler o arquivo e converter para base64
            
                let arquivoBuffer = fs.readFileSync(novaTemplate.caminho);
                let arquivoBase64 = arquivoBuffer.toString('base64');
        
                // Armazenar a representação base64 no campo base64 de novaTemplate
                novaTemplate.base64 = arquivoBase64;

                //armazeno a template com base64 no array 
                templatesComBase64.push(novaTemplate);
            
        });

        return response.status(200).send({
            mensagem: 'Templates obtidas com sucesso.',
            status: 200,
            templates: templatesComBase64
         });
    }

    async publicarArquivo(request: Request, response: Response, next: NextFunction) {

        const { nome, descricao, templateId, categoriaId, base64, idUsuario, pasta } = request.body;

        let usuarios = await this.usuarioRepository.findBy({
            id: idUsuario
        });

        if(usuarios == undefined){
            return response.status(400).send({
                mensagem: 'Usuário não encontrado!',
                status: 400
             });
        }
        
        let usuario = usuarios[0];

        if(!usuario.situacao){

            //401 é não autorizado(a)
            return response.status(401).send({
                mensagem: 'Usuário desativado!',
                status: 401
             });
        }

        let templates = await this.templatesRepository.findBy({
            id: templateId
        });

        if(templates == undefined){
            return response.status(400).send({
                mensagem: 'Template não encontrada!',
                status: 400
             });
        }

        var arquivoExistente = await this.uploadsRepository.findBy({
            nome: nome
        });

        if(arquivoExistente.length > 0){
            return response.status(400).send({
                mensagem: 'Já existe um arquivo com este nome!',
                status: 400
            });
        }

        let template = templates[0];

        if(!template.situacao){

            //401 é não autorizado(a)
            return response.status(401).send({
                mensagem: 'Template desativada!',
                status: 401
             });
        }

        let categorias = await this.categoriasRepository.findBy({
            id: categoriaId
        });

        if(categorias.length == 0){
            return response.status(400).send({
                mensagem: 'categoria não encontrada!',
                status: 400
             });
        }
        
        let categoria = categorias[0];

        let colunas = await this.colunasRepository.findBy({
            templateId: templateId
        });
        

        let urlArquivo = '';

        const spawn = require('child_process').spawn;
        const path = require('path'); 

        //caminho para o script em py
        const caminhoScript = path.join(__dirname, '../scripts/upload-arquivo.py');

            //spawn para iniciar um novo processo Python
            let jsonColunas = JSON.stringify(colunas);
            console.log(jsonColunas);

            const fs = require('fs');
            // Define the directory path
            const directoryPath = 'temp';
            // Save base64 data to a temporary file
            if (!fs.existsSync(directoryPath)) {
                fs.mkdirSync(directoryPath);
            }
            
            // Save base64 data to a temporary file
            const tempFilePath = path.join(directoryPath, 'base64data.txt');
            fs.writeFileSync(tempFilePath, base64);

            const script = spawn('python', [caminhoScript, JSON.stringify(template), nome, tempFilePath, jsonColunas, pasta ]);
            let erros = '';
            //tratamento 
            let diretorio = '';
            script.stdout.on('data', async (data) => {
                
                console.log(`diretório do arquivo: ${data}`);
                 diretorio = data.toString();
                
              });

            script.stderr.on('data', (data) => {
              console.log(`erro: ${data}`);
              erros += data;
            });

            script.on('close', async (code) => {
              console.log(`python finalizou com código:  ${code}`);
             
              if(code == 1){
                return response.status(400).send({
                    mensagem: erros,
                    status: 400
                 });
              }

              try {

                const upload = new Uploads();
                upload.nome = nome;
                upload.descricao = descricao;
                upload.caminho = diretorio.replace(/\s/g, '');
                upload.criadopor = usuario.matricula;
                upload.dataUpload = new Date();
                upload.template = template;
                upload.categoria = categoria;
                upload.status = 'pendente';
                upload.usuario = usuario;

                let uploadDatabase = await this.uploadsRepository.create(upload);

                await this.uploadsRepository.save(uploadDatabase);
          
              return response.status(201).json({
                mensagem: 'Arquivo enviado com sucesso.', 
                status: 201 
               });
            } catch (error) {
              console.error('Erro ao salvar a URL do template:', error);
          
              // Retorne uma resposta de erro mais detalhada
              return response.status(500).json({ mensagem: 'Erro ao criar template: ' + error.message, status: 500 });
            }
            });
    } 
}