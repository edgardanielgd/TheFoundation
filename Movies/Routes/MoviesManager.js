const MoviesService = require("../services/MoviesService");

class MoviesManager{
    constructor(service, checkJwt, checkScopes){
        this.service = service;
        this.router = require("express").Router();

        this.router.post("/", checkJwt, async (req, res, next) => {
            try{
                const { query, projection, sort, offset, limit, group_by, new_document} = req.body;
                var response;
                if( new_document ){ //Insertion

                    if( req.user ){
                        const user = req.user;
                        const permissions = user.permissions;
                        if( permissions && (
                            permissions == "read:statistics" || 
                            permissions.includes( "read:statistics")) ){
                                response = await service.insertOne( new_document, service.Collection );
                            }else{
                                response = {
                                    error: "Insufficient permissions"
                                }
                            }
                    }else{
                        response = {
                            error: "Insufficient permissions"
                        }
                    }
                    
                }else{ //Query
                    response = await service.search( query, projection, sort, offset, limit, group_by);
                }
                res.send( response );
            }catch(e){
                next(e);
            }
        });

        this.router.patch("/:id", checkJwt, checkScopes(["read:statistics"]), async( req, res, next) => {
            try{
                const { id } = req.params;
                const { updated_document} = req.body;
                const response = await service.updateOne( id, updated_document );
                res.send( response );
            }catch(e){
                next(e);
            }
        });

        this.router.delete("/:id", checkJwt, checkScopes(["read:statistics"]), async( req, res, next) => {
            try{
                const { id } = req.params;
                const response = await service.deleteOne( id );
                res.send( response );
            }catch(e){
                next(e);
            }
        });
    }

    generate = (file, trainFile, predService) => {
        this.service.generate( file , trainFile, predService);
    }
    
    
}

module.exports = (mongoClient, dbName, dbCollection, checkJwt, checkScopes) => {
    let service = new MoviesService(mongoClient, dbName, dbCollection);
    let moviesManager = new MoviesManager( service, checkJwt, checkScopes );
    return moviesManager;
}