import { UsuarioController } from "../controller/UsuarioController"

export const routesUsuarios = [{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "get",
    //rota informada na url pelo cliente
    route: "/usuario/listar",
    //classe que o servidor deve procurar 
    controller: UsuarioController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarUsuarios"
}, 
{
    method: "get",
    route: "/usuario/obter",
    controller: UsuarioController,
    action: "buscarUsuario"
}, 
{
    method: "post",
    route: "/usuario/cadastro-usuario",
    controller: UsuarioController,
    action: "cadastrarUsuario"
}, 
{
    method: "delete",
    route: "/usuario/remover-usuario/:id",
    controller: UsuarioController,
    action: "removerUsuario"
},
{
    method: "post",
    route: "/usuario/login",
    controller: UsuarioController,
    action: "loginUsuario"
},
{
    method: "put",
    route: "/usuario/editar-usuario",
    controller: UsuarioController,
    action: "editarUsuario"
},
{
    method: "post",
    route: "/usuario/status",
    controller: UsuarioController,
    action: "statusUsuario"
}]