const express = require("express");
const app = express();
const formidable = require("express-formidable");
const bodyParser = require("body-parser");
const {join} =require("path");
const config = require("./Core/configure-app");
const ConfigEnv = require("./config/configBack");
const { AuthConfig } = require("./Auth/configure-auth");
const { logErrors, errorHandler } = require("./middlewares/error.handler");
const { allowOrigins} = require("./middlewares/origins.handler");
const cookieParser = require("cookie-parser");

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

//app.use(formidable());

app.use(cookieParser());

app.use(express.static(__dirname));
app.use(express.static(join(__dirname,"Movies/Templates")));

({ checkJwt, checkScopes} = AuthConfig(ConfigEnv.DOMAIN, ConfigEnv.AUDIENCE) );


app.get("/",(_,res)=>{
    res.sendFile(join(__dirname,"Movies/Templates/index.html"))
});
app.get("/login",(_,res) => {
    res.sendFile(join(__dirname,"Movies/Templates/login.html"));
});
app.get("/menu", checkJwt, (_,res)=>{
    //Members only
    res.sendFile(join(__dirname,"Movies/Templates/menu.html"));

});
app.get("/statistics", checkJwt, checkScopes(["read:statistics"]),(_,res)=>{
    //Admins only
    res.sendFile(join(__dirname,"Movies/Templates/statistics.html"));
});

app.listen(port , ()=>{
    console.log("Server listening on localhost:3000\n");
    mongodb.connect(
       url,
       {useNewUrlParser : true, useUnifiedTopology: true},
       (err,client) =>{
            if (err) throw err;
            config.configurar(app,client,file,dbname,collectionName,checkJwt);
       });
});

app.use(logErrors);
app.use(errorHandler);
app.use(allowOrigins);




