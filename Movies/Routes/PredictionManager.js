const PredictionsService = require("../services/PredictionService");

class PredictionsManager{
    constructor(service, checkJwt, checkScopes){
        this.service = service;
        this.router = require("express").Router();

        this.router.get("/:id",checkJwt, checkScopes(["read:statistics"]), async (req, res, next) => {
            try{
                const { id } = req.params;
                const response = await this.service.predict( id );
                res.send( response );
            }catch(e){
                next(e);
            }
        });
    }

    
    
}

module.exports = (mongoClient, dbName, dbCollection, checkJwt, checkScopes) => {
    let service = new PredictionsService(mongoClient, dbName, dbCollection);
    let predictionsManager = new PredictionsManager( service, checkJwt, checkScopes);
    return predictionsManager;
}