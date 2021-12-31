class MoviesService {
    constructor(mongoClient,dbName,dbCollection){
        this.mongoClient = mongoClient;
        this.db = this.mongoClient.db(dbName);
        this.Collection = this.db.collection(dbCollection);
    }

    search = (match, projection, order, offset, limit) => {
        return new Promise((resolve, reject) => {
            let cursor = this.Collection.aggregate([
                {$match: match},
                {$project: projection},
                {$sort : order},
                {$skip : offset},
                {$limit : limit}
            ]);
            let arr = [];
            let found_at_least_one = false;
            cursor.forEach((row) => {
                if(!found_at_least_one)found_at_least_one = true;
                arr.push(row);
            }, (err) =>{ //done
                if(err){
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

    insertMany = (data) => {
        return new Promise( (resolve, reject) => {
            this.Collection.insertMany(csvData, (err,resM) => {
                if(err) reject(err);
                console.log("Inserted : "+resM.insertedCount+" rows");
                resolve(resM.insertedCount);
            });
        });
    }
}

module.exports = MoviesService;