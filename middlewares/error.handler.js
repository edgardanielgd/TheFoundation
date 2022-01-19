function logErrors (err, req, res, next){
    console.log(err);
    next(err);
}
function errorHandler (err, req, res, next){
    if(err.status == 401  || err.statusCode == 403){
        res.status(err.status).redirect("/");//Redirects to main on auth error
    }else{
        res.send({
            message: err.message,
            stack: err.stack,
            code: err.status
        })
    }
}

module.exports = { logErrors, errorHandler }