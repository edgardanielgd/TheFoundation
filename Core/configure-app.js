const lecturaInicial = require("../Movies/Views/leer_base.js");
const buscador = require("../Movies/Views/busqueda.js");
const busquedaMPM = require("../Movies/Views/most-popular");
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