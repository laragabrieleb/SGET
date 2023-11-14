import { PermissoesController } from "../controller/PermissoesController";
import { TemplateController } from "../controller/TemplateController";
import { UploadsController } from "../controller/UploadController";

export const routesUploads = [{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "get",
    //rota informada na url pelo cliente
    route: "/upload/listar-ativas",
    //classe que o servidor deve procurar 
    controller: UploadsController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarTemplatesAtivas"
},
{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "get",
    //rota informada na url pelo cliente
    route: "/upload/listar-categorias",
    //classe que o servidor deve procurar 
    controller: UploadsController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarCategorias"
},
{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "get",
    //rota informada na url pelo cliente
    route: "/upload/listar-arquivos",
    //classe que o servidor deve procurar 
    controller: UploadsController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarArquivos"
},
{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "post",
    //rota informada na url pelo cliente
    route: "/upload/publicar",
    //classe que o servidor deve procurar 
    controller: UploadsController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "publicarArquivo"
},
{
    //DEFINE as rotas que o cliente pode requisitar ao servidor.

    //tipo de requisicao (GET, POST, PUT, DELETE)
    method: "put",
    //rota informada na url pelo cliente
    route: "/upload/alterar-status",
    //classe que o servidor deve procurar 
    controller: UploadsController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "alterarStatusArquivo"
},
{
    method: "get",
    route: "/upload/obter-arquivos-usuario",
    //classe que o servidor deve procurar 
    controller: UploadsController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarArquivosUsuario"
},
{
    method: "get",
    route: "/upload/obter-dados-dashboard",
    //classe que o servidor deve procurar 
    controller: UploadsController,
    //método que o servidor vai executar para gerar a resposta ao cliente
    action: "listarArquivosParaDashboard"
}
]