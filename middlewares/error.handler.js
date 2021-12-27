function logErrors (err, req, res, next){
    console.log(err);
    next(err);
}
function errorHandler (err, req, res, next){
    if(err.status == 401){
        res.status(401).redirect("/");//Redirects to main on auth error
    }else{
        res.send({
            message: err.message,
            stack: err.stack
        })
    }
}

module.exports = { logErrors, errorHandler }