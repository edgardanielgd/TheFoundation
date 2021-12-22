(function (window,undefined) {
    var auth0 = null;
    window.addEventListener("load",async () => {
        try{
            auth0 = (await Utilities.configureAuth());
            await auth0.checkSession();
            let authenticated = await auth0.isAuthenticated();
            if(!authenticated){
                alert("Su sesión expiró. Retornando al inicio");
                window.location.replace("http://localhost:3000");
            }
        }catch(e){
            alert("Su sesión expiró. Retornando al inicio");
            window.location.replace("http://localhost:3000");
        }
    },false);
})(window);