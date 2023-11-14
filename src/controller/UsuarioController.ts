import { AppDataSource } from "../data-source"
import { NextFunction, Request, Response } from "express"
import { Usuarios, senhaEhValida } from "../entity/Usuarios"
import * as bcrypt from 'bcrypt';
import { usuarioPermissoes } from "../entity/UsuariosPermissoes";
import { Permissoes } from "../entity/Permissoes";

export class UsuarioController {

    private userRepository = AppDataSource.getRepository(Usuarios);
    private permissaoRepository = AppDataSource.getRepository(Permissoes);
    private usuarioPermissaoRepository = AppDataSource.getRepository(usuarioPermissoes);

    //buscar todos os registros dentro do repositório
    async listarUsuarios(request: Request, response: Response, next: NextFunction) {
        let usuarios = await this.userRepository.find();

        return response.status(200).send({
            mensagem: 'Usuários encontrados com sucesso.',
            status: 200,
            usuarios: usuarios
         });
    }

    //buscar um único registro de usuário com base no ID fornecido como parâmetro de rota
    async buscarUsuario(request: Request, response: Response, next: NextFunction) {
        const idusuario = request.query.id; 

        const usuario = await this.userRepository
                .createQueryBuilder('usuario')
                .leftJoinAndSelect('usuario.usuarioPermissoes', 'usuarioPermissoes')
                .where('usuario.id = :id', { id: idusuario })
                .getOne();

        console.log(usuario)
        //Status
        // - 400 BadRequest (Requisição mal sucedida - houve algum erro do lado do cliente, como dados
        // mal preenchidos ou nulos)

        // - 404 NotFound (Recurso não encontrado - o cliente buscou um recurso (rota) do meu servidor
        // que não existe, ex: buscou rota /usuarie ao invés de /usuarios)

        // - 500 InternalServerError (Erro de servidor - ocorreu algum erro do lado do servidor que não
        // foi culpa do cliente)

        // - 200  Succcess (Sucesso - o cliente conseguiu se comunicar com o servidor.)

        // - 201  Succcess (Sucesso - o cliente conseguiu se criar algo no servidor.)


        // Request e response - sempre em JSON, é o padrão de comunicação de dados entre servidor e cliente
        
        if (!usuario) {

            return response.status(400).send({
                mensagem: 'Usuário não encontrado.',
                status: 400
             });
        }
        return response.status(200).send({
            mensagem: 'Usuários encontrados com sucesso.',
            status: 200,
            usuario: usuario
         });
    }

    //método usado para validar login de usuário
    //matrícula e senha 
    async loginUsuario(request: Request, response: Response, next: NextFunction){
        try{
            console.log(request.body);

            const { matricula, senha } = request.body; //recebendo

            // verificar se matricula e senha foram fornecidos
            if (!matricula || !senha) {
                return response.status(400).send({
                     mensagem: 'Matrícula e senha são obrigatórios.',
                     status: 400
                    });
             }

            // Procure um usuário com base na matrícula recebida
            const usuario = await this.userRepository.findOne({ where: { matricula } });

            
            if (!usuario) {
                console.log('usuario nao encontrado')
                return response.status(401).send({
                     mensagem: 'Usuário não encontrado.' ,
                     status: 401
                    });
              }

            //comparar a senha recebida com a senha do banco correspondente ao usuário
            const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

            if (!senhaCorreta) {
                return response.status(401).send({
                     mensagem: 'Senha incorreta.' ,
                     status: 401
                    });
              }

              //obter permissoes do usuário a partir da tabela usuarioPermissoes
            const usuarioPermissoes = await this.usuarioPermissaoRepository
              .createQueryBuilder('usuarioPermissoes')
              .leftJoinAndSelect('usuarioPermissoes.permissao', 'permissao')
              .where('usuarioPermissoes.usuarioId = :id', { id: usuario.id })
              .getMany();

            console.log(usuarioPermissoes);

            let permissoes : Permissoes[] = [];

            usuarioPermissoes.forEach(usuarioPermissao => {
                permissoes.push(usuarioPermissao.permissao);
            });

            console.log(permissoes);
            
            return response.status(200).send({ 
                mensagem: 'Login bem-sucedido.',
                usuario: usuario,
                permissoes: permissoes,
                status: 200
            });
        }
        catch (error) {
            console.error('Erro ao logar:', error);

                return response.status(500).send({
                mensagem: 'Erro ao tentar logar, tente novamente mais tarde.',
                status: 500
                 });
        }
    }
        
    

    //método usado para criar um novo registro de usuário no banco de dados
    async cadastrarUsuario(request: Request, response: Response, next: NextFunction) {
        try{
            const { nome, matricula, senha, criadopor, permissoes } = request.body;
            console.log(request.body)
            //senha deve ter no minimo 8 caracteres
            if(!senhaEhValida(senha)){
                return response.status(400).send({
                    mensagem: 'A senha deve conter no mínimo 8 caracteres',
                    status: 400
                 });
            }

            //não pode haver outro usuário com a mesma matrícula
            var usuarioDatabase = await this.userRepository.findOneBy({
                matricula: matricula
            });

            if(usuarioDatabase){
                return response.status(400).send({
                    mensagem: 'Já existe um usuário com esta matrícula!',
                    status: 400
                 });
            }
            
            // Criptografar a senha antes de salvá-la no banco de dados
            const hashedPassword = await bcrypt.hash(senha, 10);

            //crio o usuário
            const usuario =  this.userRepository.create({
                nome,
                matricula,
                senha: hashedPassword,
                datacriacao: new Date(),
                situacao: true,
                criadopor: criadopor,
            });

            console.log('usuario criado')
            //crio um array vazio de usuarioPermissoes
            let usuarioPermissoes: usuarioPermissoes[] = [];

            //para cada permissao enviada pelo front
            permissoes.forEach(async idPermissao => {

                //busco a permissao no banco de dados (tabela Permissoes) através do Id
                var permissaoDatabase = await this.permissaoRepository.findOneBy({
                    id: idPermissao
                });
                console.log('permissao encontrada:', permissaoDatabase)
                //adiciono no array vazio de usuarioPermissoes, um novo item
                //informando o usuário que estou cadastrando
                //e a permissão selecionada no front
                usuarioPermissoes.push({
                    usuario: usuario,
                    permissao: permissaoDatabase as Permissoes
                })
            });

            //salvando o usuário no banco de dados
            await this.userRepository.save(usuario);
            console.log('usuario salvo')
            //inserindo as permissoes do usuário no banco de dados
            //através do array que foi preenchido no loop
            const usuarioPermissoesDatabase = this.usuarioPermissaoRepository.create(usuarioPermissoes);

            //salvando as permissões do usuário no banco de dados
            await this.usuarioPermissaoRepository.save(usuarioPermissoesDatabase)

            return response.status(200).send({
                mensagem: 'Usuário criado com sucesso.',
                status: 200
             });
        } 
        catch (error) {
            console.log(error);
            return response.status(500).send({
                mensagem: 'Erro ao criar usuário, tente novamente mais tarde.',
                status: 500
             });
        }
    }
    
    //mudar o status do usuário
    async statusUsuario(request: Request, response: Response, next: NextFunction) {
        try{

            const { idUsuario } = request.body;
            const usuario = await this.userRepository.findOneBy({
                id: idUsuario
            });

            if (!usuario) {
                return response.status(400).send({
                    mensagem: 'Usuário inexistente!',
                    status: 400
                });
            }

            usuario.situacao = !usuario.situacao; //troca de situação

            
            await this.userRepository.save(usuario);

            return response.status(200).send({
                mensagem: 'Status do usuário atualizado com sucesso!',
                status: 200
            });

        }
        catch (error) {
            return response.status(500).send({
                mensagem: 'Erro ao alterar o status do usuário, tente novamente mais tarde.',
                status: 500
             });
        }
    }


    //editar usuário
    //pegar usuário já existente e poder modificar, busco pelo id
    async editarUsuario(request: Request, response: Response, next: NextFunction) {
        try {
            //usuarioPermissoes é um array de id
            const { idUsuario, nome, matricula, usuarioPermissoes } = request.body;

            const usuario = await this.userRepository.findOneBy({
                id: idUsuario
                })
    
            if (!usuario) {
                return response.status(400).send({
                    mensagem: 'Usuário inexistente!',
                    status: 400
                });
            }
    
            // Atualize as propriedades do usuário com os novos valores
            usuario.nome = nome;
            usuario.matricula = matricula;
            
            //busco as permissões antigas do usuário (antes da edição)
            const permissoesAntigas = await this.usuarioPermissaoRepository.findBy({
                usuarioId: idUsuario
                })

            //caso ele tenha alguma permissão antes da edição, removo todas
            if(permissoesAntigas.length > 0){
                await this.usuarioPermissaoRepository.remove(permissoesAntigas);
            }

            let novasPermissoes : usuarioPermissoes[] = [];
            
            //para cada permissao selecionada
            
            await usuarioPermissoes.forEach(async idPermissaoSelecionada => {

                //obter permissao selecionada no banco de dados
                let permissaoDatabase = await this.permissaoRepository.findOneBy({
                    id: idPermissaoSelecionada
                })
                //adiciono a permissao selecionada ao array
                novasPermissoes.push({
                    permissao: permissaoDatabase,
                    usuario: usuario
                });
            });
            // Salve o usuário atualizado no banco de dados
            await this.userRepository.save(usuario);

            let novasPermissoesDatabase = await this.usuarioPermissaoRepository.create(novasPermissoes);

            await this.usuarioPermissaoRepository.save(novasPermissoesDatabase);

    
            return response.status(200).send({
                mensagem: 'Usuário editado com sucesso!',
                status: 200
             });
    
        } catch (error) {
            return response.status(500).send({
                mensagem: 'Erro ao editar usuário, tente novamente mais tarde.',
                status: 500
             });
        }
    }
    

    //excluir um registro de usuário com base no ID fornecido como parâmetro de rota.
    async removerUsuario(request: Request, response: Response, next: NextFunction) {
        try{
            const id = request.params.id;

            const usuario = await this.userRepository.findOneBy({
            id: id
            })

            if (!usuario) {
                return response.status(400).send({
                    mensagem: 'Usuário inexistente!',
                    status: 400
                 });
            }

            await this.userRepository.remove(usuario);

            return response.status(200).send({
                mensagem: "Usuário foi removido",
                status: 200
             });
        }
        catch (error){
            return response.status(500).send({
                mensagem: 'Erro ao remover usuário, tente novamente mais tarde.',
                status: 500
            });
        };

    }
}