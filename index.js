const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const {join} =require("path");
const csvtojson = require("csvtojson");
const port = 3000;
const mongodb = require("mongodb").MongoClient;
let url = "mongodb://localhost:27017";
let dbname = "BoxOffice";
let collectionName = "Test";

const itemsPerTable = 20;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended:true
})
);

app.use(cors());
app.use(express.static(__dirname));
app.use(express.static(join(__dirname,"pages")));

app.get("/menu",(_,res)=>{
    res.sendFile(join(__dirname,"pages/menu.html"));
})
app.get("/login",(_,res) => {
    res.sendFile(join(__dirname,"pages/login.html"));
})
app.post("/search",(req,res)=>{
    try{
        let query = req.body;
        if(!req.body.Tipo){
            res.send("Imposible encontrar los elementos de formulario correctos");
            return;
        }
        mongodb.connect(
            url,
            {useNewUrlParser : true, useUnifiedTopology: true},
            (err,client) =>{
                if (err) throw err;
                let db = client.db(dbname);
                let collection = db.collection(collectionName);
                let query = {};
                switch(req.body.Tipo){
                    case "1":{
                        if(!req.body.Valor){
                            res.send("Formulario inválido");
                            return;
                        }
                            query={
                                id:{"$eq":req.body.Valor}
                            };
                        break;
                    }
                    case "2":{
                        if(!req.body.Valor){
                            res.send("Formulario inválido");
                            return;
                        }
                        query={
                            original_title:{"$regex":".*"+req.body.Valor+".*","$options":"i"}
                            };
                        break;
                        }
                        case "3":{
                            if(!req.body.Min || !req.body.Max || parseInt(req.body.Min) > parseInt(req.body.Max)){
                                res.send("Formulario inválido");
                                return;
                            }
                            query={
                                "$and":[
                                {"popularity":{"$exists":true,"$ne":""}},
                                {"$expr":
                                    {"$gte" : [
                                        {"$convert" : {input:"$popularity", to: "decimal"}},
                                        parseInt(req.body.Min)
                                    ]}},
                                {"$expr":
                                    {"$lte" : [
                                        {"$convert" : {input:"$popularity", to: "decimal"}},
                                        parseInt(req.body.Max)
                                    ]}}
                                
                                ]
                            };
                        break;
                    }
                        case "4":{
                            if(!req.body.Min || !req.body.Max || parseInt(req.body.Min) > parseInt(req.body.Max)){
                                res.send("Formulario inválido");
                                return;
                            }
                            query={
                                "$and":[
                                {"runtime":{"$exists":true,"$ne":""}},
                                {"$expr":
                                    {"$gte" : [
                                        {"$convert" : {input:"$runtime", to: "decimal"}},
                                        parseInt(req.body.Min)
                                    ]}},
                                {"$expr":
                                    {"$lte" : [
                                        {"$convert" : {input:"$runtime", to: "decimal"}},
                                        parseInt(req.body.Max)
                                    ]}}
                                ]
                            };
                        break;
                        }
                        default:{
                            res.send("Formulario inválido");
                            return;
                        }
                }
                
                /*collection.find(
                        query,
                        {
                    projection: {
                        _id:0,
                        id:1,
                        original_title:1,
                        popularity:1,
                        poster_path:1,
                        runtime:1,
                        belongs_to_collection:1
                    },
                    limit : itemsPerTable
                        }
                ).toArray().then(result => {
                    console.log(result);
                    if(result.length > 0){
                            let cadena = "<table><tr><th>ID</th><th>Poster</th><th>Título</th><th>Popularidad</th><th>Duracion</th></tr>";
                            result.forEach(row => {                            
                                let fila = "<tr>";
                                fila += "<td>"+row.id+"</td>";
                                let src = row.poster_path;
                                
                                    fila += "<td><img src = 'https://image.tmdb.org/t/p/original"+src+"'"+
                                    " width=50 height=50 alt = 'Poster' onerror='this.src = \"https://image.freepik.com/free-icon/interrogation-mark-circle_318-9651.jpg\"'></td>";
                                    fila += "<td>"+row.original_title+"</td>";
                                    fila += "<td>"+row.popularity+"</td>";
                                    fila += "<td>"+row.runtime+"</td>";
                                fila += "</tr>";
                                cadena += fila;
                            })
                            cadena += "</table>";
                            res.send(cadena);
                    }else{
                        res.send("No se encontraron coincidencias");
                    }

                });*/
                let cursor = collection.aggregate([
                    {$match:query},
                    {$project: {
                        _id:0,
                        id:1,
                        original_title:1,
                        popularity:1,
                        poster_path:1,
                        runtime:1,
                        belongs_to_collection:1,
                        col_poster_path:{$cond:{
                            if:{"$ne":["$belongs_to_collection",""]},
                            then:{
                                $arrayElemAt:["$belongs_to_collection",0]
                            },
                            else:""
                        }}
                        /*belongs_parsed:{
                            $function : {
                                body: `function(jsonString){
                                    return JSON.parse(jsonString)
                                }`,
                                args:["$belongs_to_collection"],
                                lang:"js"
                            }
                        }*/
                    }},
                    {$limit : itemsPerTable}
                ]);
                let cadena = "<table><tr><th>ID</th><th>Poster</th><th>Título</th><th>Popularidad</th><th>Duracion</th></tr>";
                let found_at_least_one = false;
                cursor.forEach((row) => {
                    console.log(row);
                    if(!found_at_least_one)found_at_least_one = true;
                    let fila = "<tr>";
                    fila += "<td>"+row.id+"</td>";
                    let src = row.poster_path;
		            if(row.col_poster_path != "" && row.col_poster_path.poster_path)
                        src = row.col_poster_path.poster_path;
                    fila += "<td><img src = 'https://image.tmdb.org/t/p/original"+src+"'"+
                            " width=50 height=50 alt = 'Poster' onerror='this.src = \"https://image.freepik.com/free-icon/interrogation-mark-circle_318-9651.jpg\"'></td>";
                    fila += "<td>"+row.original_title+"</td>";
                    fila += "<td>"+row.popularity+"</td>";
                    fila += "<td>"+row.runtime+"</td>";
                    fila += "</tr>";
                    cadena += fila;
                }, (err) =>{ //done
                    if(err){
                        res.send("No se pudieron obtener los datos");
                        console.log(err);
                    }else{
                        if(found_at_least_one){
                            cadena += "</table>";
                            res.send(cadena);
                        }else res.send("No se encontraron coincidencias");
                    }

                });
                
            }
        )
    }catch(e){
        console.log(e);
    }

});

const parseHelper = (item,head,resultRow,row,colIdx) => {
	// Converting to JSON format second degree subdocuments
	try{
	if(!item || item.trim() === ""){
		return "";
	}
	        let vari = item.replaceAll("'","\""); //A common char not allowed on json.parse()
        	vari = vari.replaceAll("None","\"\""); //Initial format includes a "None" keyword
	        // So it will be replaced for an empty string
        	let parsed = JSON.parse(vari);
	        return parsed;
	}catch(e){
		return "Error"; //It will be solved on later versions
	}
}
app.listen(port, ()=>{
    console.log("Server listening\nReading .csv data");
    csvtojson({
        colParser:{
            "genres":function(item,head,resultRow,row,colIdx){
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
   .fromFile("data/test.csv")
   .then(csvData => {
       mongodb.connect(
           url,
           {useNewUrlParser : true, useUnifiedTopology: true},
           (err,client) =>{
               if (err) throw err;
               let db = client.db(dbname);
               let collection = db.collection(collectionName);
               collection.drop(); //Deletes all entries
               collection.insertMany(csvData, (err,resM) => {
                   if(err) throw err;
                   console.log("Insertadas : "+resM.insertedCount+" filas");
                   client.close();
               });
           }
       )
   }
   )
});

app.get("/",(_,res)=>{
    res.sendFile(join(__dirname,"index.html"))
});

