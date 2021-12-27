const searchPath = "/search";

class Buscador{
    constructor(app,mongoclient,dbname,collectionName,checkJwt){
        this.app = app;
        this.mongoclient = mongoclient;
        this.dbname = dbname;
        this.collectionName = collectionName;
        
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
    
    search = (req,res) => {
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
            let db = this.mongoclient.db(this.dbname);
            let collection = db.collection(this.collectionName);
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
                default:{
                    res.send({
                        error: "Formulario inválido"
                    });
                    return;
                    }
                }
                let cursor = collection.aggregate([
                    {$match:query},
                    {$project: {
                        _id:0,
                        id:1,
                        poster_path:1,
                        original_title:1,
                        popularity:1,
                        runtime:1,
                        belongs_to_collection:1,
                        title:1,
                        genres:1,
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
                    }},
                    {$limit : MaxItems}
                ]);
                let arr = [];
                let found_at_least_one = false;
                cursor.forEach((row) => {
                    if(!found_at_least_one)found_at_least_one = true;
                    arr.push(row);
                }, (err) =>{ //done
                    if(err){
                        res.send({
                            error: "No se pudieron obtener los datos"
                        });
                        console.log(err);
                    }else{
                        if(found_at_least_one){
                            res.send({
                                data: arr
                            });
                        }else{
                            res.send({
                                error: "No se encontraron coincidencias"
                            });
                        }
                    }

                });

    }
}
exports.configurar = (app,mongoclient,dbname,collectionName,checkJwt) => {
    let lector = new Buscador(app,mongoclient,dbname,collectionName,checkJwt);
}