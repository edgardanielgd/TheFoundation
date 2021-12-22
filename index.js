const express = require("express");
const app = express();
const formidable = require("express-formidable");
const {join} =require("path");
const config = require("./Core/configure-app.js");

const ConfigEnv = require("./config/configBack");

const dbname = "BoxOffice";
const collectionName = "Data";
const mongodb = require("mongodb").MongoClient;

const User = encodeURIComponent(ConfigEnv.DB_USER);
const Password = encodeURIComponent(ConfigEnv.DB_PASSWORD);
const port = ConfigEnv.PORT;

var url = "";
if(User && Password){
    url = "mongodb+srv://"+User+":"+Password+"@cluster0.rnfi9.mongodb.net/"+dbname+"?retryWrites=true&w=majority";
}else{
    url = "mongodb://localhost:27017";
}
const file = join(__dirname,"data/test.csv");

app.use(express.json());
app.use(express.urlencoded({
    extended:true
})
);

app.use(formidable());

app.use((req,res,next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Headers', 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method');
        res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
        res.header('Allow', 'GET, POST, OPTIONS, PUT, DELETE');
        next();
});

app.use(express.static(__dirname));
app.use(express.static(join(__dirname,"Movies/Templates")));


app.get("/menu",(_,res)=>{
    res.sendFile(join(__dirname,"Movies/Templates/menu.html"));
})
app.get("/login",(_,res) => {
    res.sendFile(join(__dirname,"Movies/Templates/login.html"));
});
app.get("/",(_,res)=>{
    res.sendFile(join(__dirname,"Movies/Templates/index.html"))
});

app.listen(port , ()=>{
    console.log("Server listening\nReading .csv data");
    mongodb.connect(
       url,
       {useNewUrlParser : true, useUnifiedTopology: true},
       (err,client) =>{
            if (err) throw err;
            config.configurar(app,client,file,dbname,collectionName);
       });
});



