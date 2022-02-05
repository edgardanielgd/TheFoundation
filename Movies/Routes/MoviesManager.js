const MoviesService = require("../services/MoviesService");

class MoviesManager{
    constructor(service){
        this.service = service;
        this.router = require("express").Router();

        this.router.post("/", async (req, res, next) => {
            try{
                const { query, projection, sort, offset, limit, group_by, new_document} = req.body;
                var response;
                if( new_document ){ //Insertion
                    response = await service.insertMany( [new_document], service.Collection );
                }else{ //Query
                    response = await service.search( query, projection, sort, offset, limit, group_by);
                }
                res.send( response );
            }catch(e){
                next(e);
            }
        });

        this.router.patch("/:id", async( req, res, next) => {
            try{
                const { id } = req.params;
                const { updated_document} = req.body;
                const response = await service.updateOne( id, updated_document );
                console.log( response );
                res.send( response );
            }catch(e){
                next(e);
            }
        });

        this.router.delete("/:id", async( req, res, next) => {
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

module.exports = (mongoClient, dbName, dbCollection) => {
    let service = new MoviesService(mongoClient, dbName, dbCollection);
    let moviesManager = new MoviesManager( service );
    return moviesManager;
}