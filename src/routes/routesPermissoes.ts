import { PermissoesController } from "../controller/PermissoesController";

export const routesPermissoes = [{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "get",
    //rota informada na url pelo cliente
    route: "/permissoes/listar",
    //classe que o servidor deve procurar 
    controller: PermissoesController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarPermissoes"
},
{   
    method: "post",
    route: "/permissoes/criar",
    //classe que o servidor deve procurar 
    controller: PermissoesController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "criarPermissoes"
}]; 