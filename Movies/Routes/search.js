const searchPath = "/search";

const MoviesService = require("../services/MoviesService");

class Buscador{
    constructor(app,mongoclient,dbname,collectionName,checkJwt){
        this.app = app;
        this.mongoclient = mongoclient;
        this.dbname = dbname;
        this.collectionName = collectionName;
        this.service = new MoviesService(this.mongoclient, this.dbname, this.collectionName);
        this.configurarServidor(checkJwt);
    }

    configurarServidor = (checkJwt) => {
        let search = this.search;
        this.app.post(searchPath,checkJwt,(req,res,next) => {
            try{
                search(req,res);
            }catch(e){
                next(e);
            }
        });
    }
    
    search = async (req,res) => {
            
            let reqData = req.fields;
            let MaxItems = 20;

            if(!reqData || !reqData.Tipo){
                res.send({
                    error: "Imposible encontrar datos de formulario correctos"
                });
                return;
            }

            try{
                if(reqData.MaxItems)
                    MaxItems = parseInt(reqData.MaxItems);
            }catch(e){};

            let query = {}

            switch(reqData.Tipo){
                case "1":{
                    if(!reqData.Valor){
                        res.send({
                            error: "Formulario inválido"
                        });
                        return;
                    }
                    query={
                            id:{"$eq":reqData.Valor}
                        };
                        break;
                    }
                case "2":{
                    if(!reqData.Valor){
                        res.send({
                            error: "Formulario inválido"
                        });
                        return;
                    }
                    query={
                        original_title:{"$regex":".*"+reqData.Valor+".*","$options":"i"}
                        };
                    break;
                    }
                case "3":{
                    if(!reqData.Min || !reqData.Max || parseFloat(reqData.Min) >= parseFloat(reqData.Max)){
                        res.send({
                            error: "Formulario inválido"
                        });
                        return;
                    }
                    query={
                        "$and":[
                            {"popularity":{"$exists":true,"$ne":""}},
                            {"$expr":
                                {"$gte" : [
                                    {"$convert" : {input:"$popularity", to: "decimal"}},
                                    parseFloat(reqData.Min)
                                ]}},
                            {"$expr":
                                {"$lte" : [
                                    {"$convert" : {input:"$popularity", to: "decimal"}},
                                    parseFloat(reqData.Max)
                                    ]}}
                                
                                ]
                            };
                    break;
                    }
                case "4":{
                    if(!reqData.Min || !reqData.Max || parseFloat(reqData.Min) >= parseFloat(reqData.Max)){
                        res.send({
                            error: "Formulario inválido"
                        });
                        return;
                    }
                    query={
                        "$and":[
                        {"runtime":{"$exists":true,"$ne":""}},
                        {"$expr":
                           {"$gte" : [
                               {"$convert" : {input:"$runtime", to: "decimal"}},
                                    parseFloat(reqData.Min)
                            ]}},
                        {"$expr":
                            {"$lte" : [
                                {"$convert" : {input:"$runtime", to: "decimal"}},
                                parseFloat(reqData.Max)
                            ]}}
                        ]
                    };
                    break;
                }
                case "5":{
                    if(!reqData.Valor){
                        res.send({
                            error: "Formulario inválido"
                        });
                        return;
                    }
                    query = {
                        title:{"$regex":".*"+reqData.Valor+".*","$options":"i"}
                    }
                    break;
                }
                case "6":{
                    if(!reqData.Valor){
                        res.send({
                            error: "Formulario inválido"
                        });
                        return;
                    }
                    query = {
                        "genres":{
                            "$elemMatch":{
                                name:{"$regex":".*"+reqData.Valor+".*","$options":"i"}
                            }
                        }
                    }
                    break;
                }
                case "7":{
                    if(!reqData.Valor){
                        res.send({
                            error: "Formulario inválido"
                        });
                        return;
                    }
                    query = {
                        "Keywords":{
                            "$elemMatch":{
                                name:{"$regex":".*"+reqData.Valor+".*","$options":"i"}
                            }
                        }
                    }
                    break;
                }
                case "8":{
                    if(!reqData.Valor){
                        res.send({
                            error: "Formulario inválido"
                        });
                        return;
                    }
                    query = {
                        "spoken_languages":{
                            "$elemMatch":{
                                "$or":[
                                    {name: {"$regex":".*"+reqData.Valor+".*","$options":"i"}},
                                    {iso_639_1: {"$regex":".*"+reqData.Valor+".*","$options":"i"}}
                                ]
                            }
                        }
                    }
                    break;
                }
                default:{
                    res.send({
                        error: "Formulario inválido"
                    });
                    return;
                    }
                }

                let projection = {
                    _id:0,
                    id:1,
                    poster_path:1,
                    original_title:1,
                    popularity:1,
                    runtime:1,
                    belongs_to_collection:1,
                    title:1,
                    genres:1,
                    overview:1,
                    col_poster_path:{$cond:{
                        if:{
                            "$and":[
                                {"$ne":["$belongs_to_collection",""]},
                                {"$ne":["$belongs_to_collection","Error"]}
                            ]
                        },
                        then:{
                            $let:{
                                vars: {
                                    aux:{$arrayElemAt:["$belongs_to_collection",0]}
                                },
                                in: "$$aux.poster_path"
                            }
                            
                        },
                        else:""
                    }}
                };

                let sort = {
                    id:1
                }
            res.send(await this.service.search( query, projection, sort, 0, MaxItems));

    }
}
exports.configurar = (app,mongoclient,dbname,collectionName,checkJwt) => {
    let lector = new Buscador(app,mongoclient,dbname,collectionName,checkJwt);
}