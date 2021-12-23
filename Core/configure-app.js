const lecturaInicial = require("../Movies/Models/read-data.js");
const buscador = require("../Movies/Models/search.js");
const busquedaMPM = require("../Movies/Models/most-popular");
class Configuracion{
    constructor(app,mongoclient,file,dbname,collectionName){
        lecturaInicial.configurar(app,mongoclient,file,dbname,collectionName);
        buscador.configurar(app,mongoclient,dbname,collectionName);
        busquedaMPM.configurar(app,mongoclient,dbname,collectionName);
    }
}
exports.configurar = (app,mongoclient,file,dbname,collectionName) => {
    new Configuracion(app,mongoclient,file,dbname,collectionName);
}