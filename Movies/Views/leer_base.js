const csvtojson = require("csvtojson");
class Lector{
    constructor(app,mongoclient,file,dbname,collectionName){
        this.app = app;
        this.mongoclient = mongoclient;
        this.file = file;
        this.dbname = dbname;
        this.collectionName = collectionName;
    }
    
    parseHelper = (item,head,resultRow,row,colIdx) => {
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

    leerDatos = () => {
        let parseHelper = this.parseHelper;

        let db = this.mongoclient.db(this.dbname);
        
        let collection = db.collection(this.collectionName);

        db.listCollections({name:this.collectionName}).next((err,col) => {
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
                .fromFile(this.file)
                .then(csvData => {
                            collection.insertMany(csvData, (err,resM) => {
                                if(err) throw err;
                                console.log("Inserted : "+resM.insertedCount+" rows");
                            });
                        }
                    )
            }else{
                console.log("Collection succesfully found");
            }
        });
        
    }
    
}

exports.configurar = (app,mongoclient,file,dbname,collectionName) => {
    let lector = new Lector(app,mongoclient,file,dbname,collectionName);
    lector.leerDatos();
}