const moviesRouter = require("../Movies/Routes/MoviesManager");
const moviesPath = "/movies";

class Configuracion{
    constructor(app,mongoclient,file,dbname,collectionName,checkJwt){
        const MoviesManager = moviesRouter(mongoclient,dbname,collectionName);
        const router = require("express").Router();
        app.use("/api_v1", router);
        router.use( moviesPath, MoviesManager.router);
        
        //Reading or checking data existence
        MoviesManager.generate(file);
    }
}
exports.configurar = (app,mongoclient,file,dbname,collectionName,checkJwt) => {
    new Configuracion(app,mongoclient,file,dbname,collectionName,checkJwt);
}