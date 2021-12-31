const searchMPMPath = "/popularQuery";

const MoviesService = require("../services/MoviesService");

class BuscadorMPM{
    constructor(app,mongoclient,dbname,collectionName,checkJwt){
        this.app = app;
        this.mongoclient = mongoclient;
        this.dbname = dbname;
        this.collectionName = collectionName;
        this.service = new MoviesService(this.mongoclient, this.dbname, this.collectionName);
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

    searchMPM = async (req,res) => {

        let reqData = req.fields;
        let MaxItems = 12;

        try{
            if(reqData.MaxItems)
                MaxItems = parseInt(reqData.MaxItems);
        }catch(e){};

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
            popularity:-1 //Descending order
        }

        res.send(await this.service.search( {}, projection, sort, 0, MaxItems));
    }
}
exports.configurar = (app,mongoclient,dbname,collectionName,checkJwt) => {
    let lector = new BuscadorMPM(app,mongoclient,dbname,collectionName,checkJwt);
}