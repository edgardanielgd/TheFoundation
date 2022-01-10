const MoviesService = require("../services/MoviesService");

class MoviesManager{
    
    constructor(service){
        this.service = service;
        this.router = require("express").Router();

        this.router.post("/", async (req, res, next) => {
            try{
                const { query, projection, sort, offset, limit, group_by} = req.body;
                const response = await service.search( query, projection, sort, offset, limit, group_by);
                res.send( response );
            }catch(e){
                next(e);
            }
        });
    }

    generate = (file) => {
        this.service.generate( file );
    }
    
    
}

module.exports = (mongoClient, dbName, dbCollection) => {
    let service = new MoviesService(mongoClient, dbName, dbCollection);
    let moviesManager = new MoviesManager( service );
    return moviesManager;
}