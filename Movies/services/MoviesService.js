const csvtojson = require("csvtojson");
const { resolve } = require("path/posix");
const { moviesSchema } =require("../Schemas/moviesSchema");
const defaultLimit = 20;

class MoviesService {
    constructor(mongoClient,dbName,dbCollection){
        this.mongoClient = mongoClient;
        this.db = this.mongoClient.db(dbName);
        this.Collection = this.db.collection(dbCollection);
        this.dbName = dbName;
        this.dbCollection = dbCollection;
    }

    search = (query, projection, order, offset, limit, group_by) => {
        return new Promise((resolve, reject) => {

            let params = [];

            if( group_by ){
                const { group_field, group_expressions, group_unwind } = group_by;
                if( group_field && group_expressions){
                    if( group_unwind )
                        params.push({
                            $unwind: "$" + group_field
                        })
                    let group = {
                        _id: "$" + group_field,
                        ...group_expressions
                    }
                    params.push( {
                        $group : group
                    });
                }
            }
            let match = {};
            if(query){
                const { id, title, original_title, popularity_min, popularity_max,
                    runtime_min, runtime_max, genreMatch, keywordMatch, languageMatch} =
                    query;
                
                let and = [];
                let or = [];
                
                if(id){
                    or.push(
                        {
                            id: { $eq: parseInt( id ) }
                        },
                        {
                            id: { $eq: id.toString() }
                        }
                    )
                }

                if(title){
                    match["title"] = {"$regex":".*"+ title +".*","$options":"i"};
                }

                if(original_title){
                    match["original_title"] = {"$regex":".*"+original_title+".*","$options":"i"};
                }

                if(popularity_min && popularity_max){
                    and.push(
                        {"popularity":{"$exists":true,"$ne":""}},
                            {"$expr":
                                {"$gte" : [
                                    {"$convert" : {input:"$popularity", to: "decimal"}},
                                        parseFloat(popularity_min)
                                    ]
                                }
                            },
                                {"$expr":
                                    {"$lte" : [
                                        {"$convert" : {input:"$popularity", to: "decimal"}},
                                        parseFloat(popularity_max)
                                    ]
                                }
                            }
                    );
                }

                if(runtime_min && runtime_max){
                    and.push(
                        {"runtime":{"$exists":true,"$ne":""}},
                            {"$expr":
                                {"$gte" : [
                                    {"$convert" : {input:"$runtime", to: "decimal"}},
                                        parseFloat(runtime_min)
                                    ]
                                }
                            },
                                {"$expr":
                                    {"$lte" : [
                                        {"$convert" : {input:"$runtime", to: "decimal"}},
                                        parseFloat(runtime_max)
                                    ]
                                }
                            }
                    );
                }
                if(genreMatch){
                    match["genres"] = {
                        "$elemMatch":{
                            name:{"$regex":".*"+genreMatch+".*","$options":"i"}
                        }
                    }
                }

                if(keywordMatch){
                    match["Keywords"] = {
                        "$elemMatch":{
                            name:{"$regex":".*"+keywordMatch+".*","$options":"i"}
                        }
                    }
                }

                if(languageMatch){
                    match["spoken_languages"] = {
                        "$elemMatch":{
                            "$or":[
                                {name: {"$regex":".*"+languageMatch+".*","$options":"i"}},
                                {iso_639_1: {"$regex":".*"+languageMatch+".*","$options":"i"}}
                            ]
                        }
                    }
                }

                if(and.length > 0 ) match["$and"] = and;
                if(or.length > 0 ) match["$or"] = or;
            }
            params.push({
                $match: match
            });

            if(projection){
                if(projection.col_poster_path){
                    //Alternative poster path if the movie one couldnt be found
                    projection.col_poster_path = {
                        $cond:{
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
                        }
                    }
                }
            }else{
                projection = {
                    //Default data returned
                    _id: 0,
                    id: 1,
                    title: 1
                }
            }

            params.push({
                $project: projection
            });

            if( !order ) order = {
                //Default sorting by id
                id: 1
            }
            params.push({
                $sort: order
            });

            if( !offset ) offset = 0;
            if( !limit ) limit = defaultLimit;
            
            params.push({
                $skip: offset
            });

            params.push({
                $limit: limit
            });

            const cursor = this.Collection.aggregate( params );
            let arr = [];
            let found_at_least_one = false;
            cursor.forEach((row) => {
                if(!found_at_least_one)found_at_least_one = true;
                arr.push(row);
            }, (err) =>{ //done
                if(err){
                    console.log(err);
                    resolve({
                        error: "No se pudieron obtener los datos"
                    });
                }else{
                    if(found_at_least_one){
                        resolve({
                            data: arr
                        });
                    }else{
                        resolve({
                            error: "No se encontraron coincidencias"
                        });
                    }
                }

            });
        });
    }

    insertOne = (data, Collection) => {
        return new Promise( async (resolve, reject) => {
            try{
                let maxId = null;
                if( !data || !Collection){
                    resolve({
                        error: "Invalid data provided"
                    })
                    return;
                }
                const reg = data;
                if( !reg ){
                    resolve({
                        error: "Invalid entry No." + i
                    });
                    return;
                }
                if( !reg.id ){
                    const firstEntry = await Collection.findOne({}, {
                        sort:{
                            id: -1
                        }
                    });
                    if( firstEntry ){
                        maxId = parseInt(firstEntry.id);
                    }else{
                        maxId = 0;
                    }
                    data.id = ++ maxId; //Keeps it incremental
                }
                const validationResult = moviesSchema.validate( reg );
                if( validationResult.error ){
                    resolve({
                        error: validationResult.error + "\nat: " + i
                    });
                    return;
                }
                
                Collection.insertOne(data, (err,resM) => {
                    if(err) reject(err);
                    resolve({
                        insertedRows: resM.insertedCount,
                        success: "Inserted successfully"
                    });
                });
            }catch(e){
                resolve({
                    error: "There ocurred an error while adding an entry :"+ e.message
                });
            }
            });
    }

    insertMany = (data, Collection) => {
        return new Promise( async (resolve, reject) => {
            
            try{
                Collection.insertMany(data, (err,resM) => {
                    if(err) reject(err);
                    console.log("Inserted : "+resM.insertedCount+" rows");
                    resolve({
                        insertedRows: resM.insertedCount,
                        success: "Inserted successfully"
                    });
                });
            }catch(e){
                resolve({
                    error: "There ocurred an error while adding an entry :"+ e.message
                });
            }
            });
        
    }

    updateOne = (param_id, document) => {
        return new Promise( async (resolve, reject) => {
            try{
                const validationResult = moviesSchema.validate( document );
                if( validationResult.error ){
                    resolve({
                        error: validationResult.error
                    });
                    return;
                }

                const updateDocument = {
                    $set: document
                };
                
                this.Collection.findOneAndUpdate(
                    {
                        $or: [
                            {"id" : { $eq: param_id.toString() } },
                            {"id" : { $eq: parseInt( param_id ) } }
                        ]
                    },
                    updateDocument
                )
                .then(() => {
                    resolve({
                        success: "Updated successfully"
                    })
                })
                .catch( e => {
                    resolve({
                        error: e.message
                    })
                })
            }catch(e){
                resolve({
                    error: "There ocurred an error while adding an entry :"+ e.message
                });
            }
        })
    }

    deleteOne = ( param_id ) => {
        return new Promise( async (resolve, reject) => {
            this.Collection.findOneAndDelete(
                {
                    $or: [
                        {"id" : { $eq: param_id.toString() } },
                        {"id" : { $eq: parseInt( param_id ) } }
                    ]
                }
            )
            .then( () => {
                resolve({
                    success: "Deleted successfully"
                });
            })
            .catch( e => {
                resolve({
                    error: e.message
                })
            })
        })
    }

    generate = (file, trainFile, predService) => {
        const db = this.db;
        const colName = this.dbCollection;
        const defaultCollection = this.Collection;
        const trainCollection = db.collection("Train");
        const insertMany = this.insertMany;
        const parseHelper = (item,head,resultRow,row,colIdx) => {
            // Converting to JSON format second degree subdocuments
            try{
                if(!item || item.trim() === ""){ //If item is just empty
                    return "";
                }
                let vari = "";
                vari = item.replaceAll(/"([^']|\\')*?"/g,(data) => { //Matching all strings denoted by "" without '' inside
                // this will delete all sub quotes inside ''
                    let retData = data.replaceAll(/"/g," ");
                    return retData;
                });
    
                vari = vari.replaceAll(/".*?"/g,(data) => { 
                    //Matching text values which are in inverse use of quotes (" [info with at least ' character]")
                    let retData = data.replaceAll(/'/g," ");
                    return retData;
                }); //A common char not allowed on json.parse()
                
                vari = vari.replaceAll(/'/g,"\""); 
                // With the correct format, we can replace character ' to "", because json.parse() uses only the last one as valid
            
                vari = vari.replaceAll(/None|#N\/A/g,"\"\""); //Initial format includes a "None" keyword, replacing for an empty string
                vari = vari.replaceAll(/\\\w{3}/g,""); //Some unicode characters defined by \{3 letters} make it throw an error while parsing
                // So it will be replaced for an empty string
    
                let parsed = JSON.parse(vari); //Finally parse string
                return parsed;
            }catch(e){
                return "Error"; //If there is any problem parsing subdocuments
            }
        }
    
        const readData = () => {
            db.listCollections({
                name:colName
            }).next((err,col) => {
                //Checking if collection exists
                if(!col){
                    
                    csvtojson({
                        colParser:{
                            //Functions for manage correct parsing of all sub-documents
                            "genres":function(item,head,resultRow,row,colIdx) {
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "belongs_to_collection":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "production_companies":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "production_countries":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "spoken_languages":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "Keywords":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "crew":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "cast":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "id":function(item,head,resultRow,row,colIdx){
                                return parseInt( item )
                            },
                            "budget":function(item,head,resultRow,row,colIdx){
                                const parsed = parseFloat( item );
                                if( !isNaN( parsed ))
                                    return parsed;
                                else
                                    return "";
                            },
                            "popularity":function(item,head,resultRow,row,colIdx){
                                const parsed = parseFloat( item );
                                if( !isNaN( parsed ))
                                    return parsed;
                                else
                                    return "";
                            },
                            "runtime":function(item,head,resultRow,row,colIdx){
                                const parsed = parseFloat( item );
                                if( !isNaN( parsed ))
                                    return parsed;
                                else
                                    return "";
                            },
                        }})
                    .fromFile(file)
                    .then(csvData => {
                                insertMany(csvData, defaultCollection );
                            }
                        )
                    .catch( e => {
                        console.log( e )
                    })
                }else{
                    console.log("Collection succesfully found");
                }
            });
            
            db.listCollections({
                name:"Train"
            }).next((err,col) => {
                //Checking if collection exists
                if(!col){
                    csvtojson({
                        colParser:{
                            //Functions for manage correct parsing of all sub-documents
                            "genres":function(item,head,resultRow,row,colIdx) {
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "belongs_to_collection":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "production_companies":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "production_countries":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "spoken_languages":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "Keywords":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "crew":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            },
                            "cast":function(item,head,resultRow,row,colIdx){
                                return parseHelper(item,head,resultRow,row,colIdx)
                            }
                        }})
                    .fromFile(trainFile)
                    .then(csvData => {
                                insertMany(csvData, trainCollection );
                                predService.train( csvData );
                            }
                        )
                }else{
                    let allEntries = [];
                    predService.train( db.collection("Train").find() );
                    
                    console.log("Train Collection succesfully found");
                }
            });
        }

        readData();
    }
}

module.exports = MoviesService;