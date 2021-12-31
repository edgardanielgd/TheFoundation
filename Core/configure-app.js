const lecturaInicial = require("../Movies/Routes/read-data.js");
const buscador = require("../Movies/Routes/search.js");
const busquedaMPM = require("../Movies/Routes/most-popular");
class Configuracion{
    constructor(app,mongoclient,file,dbname,collectionName,checkJwt){
        lecturaInicial.configurar(app,mongoclient,file,dbname,collectionName);
        buscador.configurar(app,mongoclient,dbname,collectionName,checkJwt);
        busquedaMPM.configurar(app,mongoclient,dbname,collectionName,checkJwt);
    }
}
exports.configurar = (app,mongoclient,file,dbname,collectionName,checkJwt) => {
    new Configuracion(app,mongoclient,file,dbname,collectionName,checkJwt);
}