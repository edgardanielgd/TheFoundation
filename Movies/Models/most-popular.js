const searchMPMPath = "/popularQuery";

class BuscadorMPM{
    constructor(app,mongoclient,dbname,collectionName,checkJwt){
        this.app = app;
        this.mongoclient = mongoclient;
        this.dbname = dbname;
        this.collectionName = collectionName;
        this.configurarServidor(checkJwt);
    }
    configurarServidor = (checkJwt) => {
        let searchMPM = this.searchMPM;
        
        this.app.post(searchMPMPath,checkJwt,(req,res) => {
            try{
                searchMPM(req,res);
            }catch(e){
                next(e);
            }
        });
    }

    searchMPM = (req,res) => {
        let reqData = req.fields;
            let MaxItems = 12;
            try{
                if(reqData.MaxItems){
                    MaxItems = parseInt(reqData.MaxItems);
                }
            }catch(e){};
            let db = this.mongoclient.db(this.dbname);
            let collection = db.collection(this.collectionName);
            let cursor = collection.aggregate([
                {$sort:{
                    popularity:-1 //Descending order
                }},
                {$project: {
                    _id:0,
                    id:1,
                    poster_path:1,
                    original_title:1,
                    popularity:1,
                    runtime:1,
                    belongs_to_collection:1,
                    title:1,
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
                                error: "No se encontraron datos"
                            });
                        }
                    }

                });
        }
}
exports.configurar = (app,mongoclient,dbname,collectionName,checkJwt) => {
    let lector = new BuscadorMPM(app,mongoclient,dbname,collectionName,checkJwt);
}