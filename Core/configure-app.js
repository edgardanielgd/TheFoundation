const moviesRouter = require("../Movies/Routes/MoviesManager");
const predictionsRouter = require("../Movies/Routes/PredictionManager");
const moviesPath = "/movies";
const predictionsPath = "/moviesPredictions";

class Configuracion{
    constructor(app,mongoclient,file,trainFile,dbname,collectionName,checkJwt,checkScopes){
        const MoviesManager = moviesRouter(mongoclient,dbname,collectionName,checkJwt,checkScopes);
        const PredictionsManager = predictionsRouter(mongoclient,dbname,collectionName,checkJwt,checkScopes);
        const router = require("express").Router();
        app.use("/api_v1", router);
        router.use( moviesPath, MoviesManager.router);
        router.use( predictionsPath, PredictionsManager.router);
        
        //Reading or checking data existence
        MoviesManager.generate(file,trainFile, PredictionsManager.service);
    }
}
exports.configurar = (app,mongoclient,file,trainFile,dbname,collectionName,checkJwt,checkScopes) => {
    new Configuracion(app,mongoclient,file,trainFile,dbname,collectionName,checkJwt,checkScopes);
}