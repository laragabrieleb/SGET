import { AppDataSource } from "../data-source";
import { Templates, descricaoTemplateEhValida, nomeTemplateEhValido } from "../entity/Templates";
import { NextFunction, Request, Response } from "express"
import { Usuarios } from "../entity/Usuarios";
import { Colunas } from "../entity/Colunas";

export class TemplateController {
    private templatesRepository = AppDataSource.getRepository(Templates);
    private userRepository = AppDataSource.getRepository(Usuarios);
    private colunasRepository = AppDataSource.getRepository(Colunas);

    async listarTemplates(request: Request, response: Response, next: NextFunction) {
        let templates = await this.templatesRepository.find();

        return response.status(200).send({
            mensagem: 'Templates obtidas com sucesso.',
            status: 200,
            templates: templates
         });
    }

    //mudar o status da template
    async AlterarStatus(request: Request, response: Response, next: NextFunction) {
        try{

        const { idTemplate } = request.body;
        const template = await this.templatesRepository.findOneBy({
            id: idTemplate
        });

        if (!template) {
            return response.status(400).send({
                mensagem: 'Template inexistente!',
                status: 400
            });
        }

        template.situacao = !template.situacao; //troca de situação

        
        await this.templatesRepository.save(template);

        return response.status(200).send({
            mensagem: 'Status do template atualizado com sucesso!',
            status: 200
        });

    }
    catch (error) {
        return response.status(500).send({
            mensagem: 'Erro ao alterar o status do template, tente novamente mais tarde.',
            status: 500
         });
    }
}

    async buscarTemplate(request: Request, response: Response, next: NextFunction){
        const idTemplate = request.query.id; 
        
        const template = await this.templatesRepository.createQueryBuilder('templates')
        .leftJoinAndSelect('templates.colunas', 'colunas')
        .where('templates.id = :id', { id: idTemplate })
        .getOne();

        if (!template) {
            return response.status(400).send({
                mensagem: 'Template inexistente!',
                status: 400
            });
        }

        return response.status(200).send({
            mensagem: 'Template encontrada!',
            status: 200,
            template: template
        });
}

    async criarTemplate(request: Request, response: Response, next: NextFunction) {
            try {
                const { nome, descricao, minLinhas, maxLinhas, qtdColunas, extensao, colunas, idUsuario } = request.body; 
        
                if (!nome) {
                    return response.status(400).json({ mensagem: 'O nome da template é obrigatório.', status: 400 });
                }

                if (!descricao) {
                    return response.status(400).json({ mensagem: 'A descricao da template é obrigatório.', status: 400 });
                }

                if(!nomeTemplateEhValido(nome)){
                    return response.status(400).send({
                        mensagem: 'O nome do template deve conter no máximo 50 caracteres',
                        status: 400
                     });
                }

                if(!descricaoTemplateEhValida(descricao)){
                    return response.status(400).send({
                        mensagem: 'A descrição do template deve conter no máximo 100 caracteres',
                        status: 400
                     });
                }

                var templateExistente = this.templatesRepository.findBy({
                    nome: nome
                });

                if(!templateExistente){
                    return response.status(400).send({
                        mensagem: 'Já existe uma template com este nome!',
                        status: 400
                    });
                }

                const usuario = await this.userRepository.findOneBy({
                    id: idUsuario
                    })
        
                if (!usuario) {
                    return response.status(400).send({
                        mensagem: 'Usuário inexistente!',
                        status: 400
                    });
                }
        
                const template = new Templates();
                template.nome = nome;
                template.descricao = descricao;
                template.qtdColunas = qtdColunas;
                template.criadopor = usuario.matricula;
                template.datacriacao = new Date();
                template.situacao = true;
                template.extensao = extensao;
                template.usuario = usuario;
                

                if(maxLinhas != undefined && maxLinhas != '')
                    template.maxLinhas = maxLinhas;

                if(minLinhas != undefined && minLinhas != '')
                    template.minLinhas = minLinhas;

                let colunasNovas : Colunas[] = [];
                

                let templateDatabase = await this.templatesRepository.create(template);

                await this.templatesRepository.save(templateDatabase);

                
                colunas.forEach(item => {
                    colunasNovas.push({
                        nome: item.nome as string,
                        nulo: item.nulo as boolean,
                        tipo: item.tipo as string,
                        template: templateDatabase
                    });
                });
        
                let colunasDatabase = await this.colunasRepository.create(colunasNovas);
                
                await this.colunasRepository.save(colunasDatabase);
                
                let urlTemplate = '';

                //conexão com o py
                //import
                const spawn = require('child_process').spawn;
                const path = require('path'); 

                //caminho para o script em py
                const caminhoScript = path.join(__dirname, '../scripts/generate-template-file.py');

                //spawn para iniciar um novo processo Python
                const script = spawn('python', [caminhoScript, JSON.stringify(colunasNovas), templateDatabase.nome, templateDatabase.extensao]);

                //tratamento 
                script.stdout.on('data', async (data) => {
                    console.log(`diretorio do arquivo: ${data}`);
                    let diretorio = data.toString();

                    //remove espaços em branco
                    templateDatabase.caminho = diretorio.replace(/\s/g, '');;
                  
                    try {
                      await this.templatesRepository.save(templateDatabase);
                  
                      return response.status(201).json({ mensagem: 'Template criada com sucesso.', status: 201, url: urlTemplate });
                    } catch (error) {
                      console.error('Erro ao salvar a URL do template:', error);
                  
                      // Retorne uma resposta de erro mais detalhada
                      return response.status(500).json({ mensagem: 'Erro ao criar template: ' + error.message, status: 500 });
                    }
                  });

                script.stderr.on('data', (data) => {
                  console.log(`erro: ${data}`);

                });

                script.on('close', (code) => {
                  console.log(`python finalizou com código:  ${code}`);
                });
            } catch (error) {
                console.error('Erro ao criar template:', error);
                return response.status(500).json({ mensagem: 'Erro ao criar template.', status: 500 });
            }
    }

    async editarTemplate(request: Request, response: Response, next: NextFunction) {
        try {
            const  template  = request.body; 
            
            const templateDb = await this.templatesRepository.findOneBy({
                id: template.id
                })
    
            if (!templateDb) {
                return response.status(400).send({
                    mensagem: 'Template inexistente!',
                    status: 400
                });
            }
    
            templateDb.nome = template.nome;
            templateDb.descricao = template.descricao;
            templateDb.qtdColunas = template.qtdColunas;
            templateDb.extensao = template.extensao;
            templateDb.caminho = template.caminho;

            if(!nomeTemplateEhValido(template.nome)){
                return response.status(400).send({
                    mensagem: 'O nome do template deve conter no máximo 50 caracteres',
                    status: 400
                 });
            }

            if(!descricaoTemplateEhValida(template.descricao)){
                return response.status(400).send({
                    mensagem: 'A descrição do template deve conter no máximo 100 caracteres',
                    status: 400
                 });
            }

            if(template.maxLinhas != undefined && template.maxLinhas != '')
                templateDb.maxLinhas = template.maxLinhas;

            if(template.minLinhas != undefined && template.minLinhas != '')
                templateDb.minLinhas = template.minLinhas;

            let colunasNovas : Colunas[] = [];

            //busco as colunas antigas do template (antes da edição)
            const colunasAntigas = await this.colunasRepository.findBy({
                templateId: templateDb.id
                })

            //caso ele tenha alguma coluna antes da edição, removo todas
            if(colunasAntigas.length > 0){
                await this.colunasRepository.remove(colunasAntigas);
            }

            await this.templatesRepository.save(templateDb);

            if(template.colunas.length > 0){
                template.colunas.forEach(item => {
                    colunasNovas.push({
                        nome: item.nome as string,
                        nulo: item.nulo as boolean,
                        tipo: item.tipo as string,
                        template: templateDb
                    });
                });
        
                let colunasDatabase = await this.colunasRepository.create(colunasNovas);
                
                await this.colunasRepository.save(colunasDatabase);
            }
            
            let urlTemplate = '';

            const spawn = require('child_process').spawn;
            const path = require('path'); 

            //caminho para o script em py
            const caminhoScript = path.join(__dirname, '../scripts/edit-template-file.py');

                //spawn para iniciar um novo processo Python
                const script = spawn('python', [caminhoScript, JSON.stringify(colunasNovas), templateDb.nome, templateDb.extensao]);

                //tratamento 
                script.stdout.on('data', async (data) => {
                    console.log(`diretorio do arquivo: ${data}`);
                    let diretorio = data.toString();

                    //remove espaços em branco
                    templateDb.caminho = diretorio.replace(/\s/g, '');;
                  
                    try {
                      await this.templatesRepository.save(templateDb);
                  
                      return response.status(201).json({
                        mensagem: 'Template editada com sucesso.', 
                        status: 201 
                       });
                    } catch (error) {
                      console.error('Erro ao salvar a URL do template:', error);
                  
                      // Retorne uma resposta de erro mais detalhada
                      return response.status(500).json({ mensagem: 'Erro ao criar template: ' + error.message, status: 500 });
                    }
                  });

                script.stderr.on('data', (data) => {
                  console.log(`erro: ${data}`);

                });

                script.on('close', (code) => {
                  console.log(`python finalizou com código:  ${code}`);
                });

            
        

        } catch (error) {
            console.error('Erro ao editar template:', error);
            return response.status(500).json({
                 mensagem: 'Erro ao editar template.', 
                 status: 500 
                });
        }  
    }

    async listarTemplatesUsuario(request: Request, response: Response, next: NextFunction){
        //pegar id do usuário logado
        //vem pela url quando é get = em obter template
        const idUsuario = request.query.id;

        const templatesDoUsuario = await this.templatesRepository.find({
            where: {
              usuarioId: idUsuario,
            },
          });

          return response.status(200).json({
            mensagem: 'Templates encontradas com sucesso.', 
            templatesDoUsuario: templatesDoUsuario,

            status: 200 
           });
   
        } catch (error) {
        
            console.error('Erro ao editar template:', error);
        }

       
}
    