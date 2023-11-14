import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Permissoes } from "../entity/Permissoes"

export class PermissoesController {
    private permissoesRepository = AppDataSource.getRepository(Permissoes);
    
    //listar permissoes
    //excluir permissão de um usuário?
    //criar as permissoes
    //filtrar permissão de acordo com o usuário

    async listarPermissoes(request: Request, response: Response, next: NextFunction) {
        let permissoes = await this.permissoesRepository.find();

        return response.status(200).send({
            mensagem: 'Permissões obtidas com sucesso.',
            status: 200,
            permissoes: permissoes
         });
    }

    async criarPermissoes(request: Request, response: Response, next: NextFunction) {
            try {
                const { nome } = request.body; 
        
                if (!nome) {
                    return response.status(400).json({ mensagem: 'O nome da permissão é obrigatório.', status: 400 });
                }
        
                const permissao = new Permissoes();
                permissao.nome = nome;
        
                await this.permissoesRepository.save(permissao);
        
                return response.status(201).json({ mensagem: 'Permissão criada com sucesso.', status: 201 });
            } catch (error) {
                console.error('Erro ao criar permissão:', error);
                return response.status(500).json({ mensagem: 'Erro ao criar permissão.', status: 500 });
            }
    }
}