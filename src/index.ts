import * as express from "express"
import * as bodyParser from "body-parser"
import { Request, Response } from "express"
import { AppDataSource } from "./data-source"
import { routesUsuarios } from "./routes/routesUsuarios"
import { routesPermissoes } from "./routes/routesPermissoes"
import { Usuarios } from "./entity/Usuarios"
import * as cors from "cors";
import { routesTemplates } from "./routes/routesTemplates"
import { routesUploads } from "./routes/routesUploads"

AppDataSource.initialize().then(async () => {

    // create express app
    const app = express()
    app.use(cors()); //para permitir a comunicação com o servidor com outras URL
    //permite que seu servidor Express aceite solicitações de diferentes origens

    app.use(express.json());
    // register express routes from defined application routes
    routesUsuarios.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
    })
    routesPermissoes.forEach(route => {
            (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
                const result = (new (route.controller as any))[route.action](req, res, next)
                if (result instanceof Promise) {
                    result.then(result => result !== null && result !== undefined ? res : undefined)
    
                } else if (result !== null && result !== undefined) {
                    res.json(result)
                }
            })
    })

    routesTemplates.forEach(route => {
        (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
            const result = (new (route.controller as any))[route.action](req, res, next)
            if (result instanceof Promise) {
                result.then(result => result !== null && result !== undefined ? res : undefined)

            } else if (result !== null && result !== undefined) {
                res.json(result)
            }
        })
})

routesUploads.forEach(route => {
    (app as any)[route.method](route.route, (req: Request, res: Response, next: Function) => {
        const result = (new (route.controller as any))[route.action](req, res, next)
        if (result instanceof Promise) {
            result.then(result => result !== null && result !== undefined ? res : undefined)

        } else if (result !== null && result !== undefined) {
            res.json(result)
        }
    })
})

    // setup express app here
    // ...
    // start express server
    app.listen(3000)

    console.log("Express server has started on port 3000. Open http://localhost:3000/usuarios to see results")

}).catch(error => console.log(error))



