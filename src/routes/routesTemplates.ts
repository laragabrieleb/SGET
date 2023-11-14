import { PermissoesController } from "../controller/PermissoesController";
import { TemplateController } from "../controller/TemplateController";

export const routesTemplates = [{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "get",
    //rota informada na url pelo cliente
    route: "/template/listar",
    //classe que o servidor deve procurar 
    controller: TemplateController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarTemplates"
},
{   
    method: "post",
    route: "/template/cadastrar",
    //classe que o servidor deve procurar 
    controller: TemplateController,
    action: "criarTemplate"
},
{
    method: "put",
    route: "/template/alterar-status",
    //classe que o servidor deve procurar 
    controller: TemplateController,
    action: "AlterarStatus"
},
{
    method: "put",
    route: "/template/editar",
    //classe que o servidor deve procurar 
    controller: TemplateController,
    action: "editarTemplate"
},
{
    method: "get",
    route: "/template/obter",
    controller: TemplateController,
    action: "buscarTemplate"
},
{
    method: "get",
    route: "/template/obter-templates-usuario",
    controller: TemplateController,
    action: "listarTemplatesUsuario"
},
{
    method: "get",
    route: "/template/obter-status-usuario",
    controller: TemplateController,
    action: "obterStatusTemplate"
}

]; 