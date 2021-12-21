var auth0 = null;

const writeStatus = (data) => {
    document.getElementById("status").innerHTML = data;
}

window.addEventListener("load",async () => {
    try{

        await configureFirstAuth();
        await auth0.checkSession();
        writeStatus("Verificando si estas autenticado....");
        let authenticated = await auth0.isAuthenticated();
        if(authenticated){
            writeStatus("Bienvenido de nuevo!");
            window.location.replace("http://localhost:3000/menu");
        }else{
            writeStatus("Revisando el estado de su solicitud...");
            let query = window.location.search;
            if(query.includes("code=") && query.includes("state=")){
            writeStatus("Recibiendo info de logueo...");
            try{
                let result = await auth0.handleRedirectCallback();
                writeStatus("Logueado exitosamente!");
                let user = await auth0.getUser();
                writeStatus("Bienvenido "+user.name);
                window.location.replace("http://localhost:3000/menu");
            }catch(e){
                writeStatus(e);
                window.location.replace("http://localhost:3000");
            }
            
             
        }else{
            writeStatus("Se te redirigirá pronto..");
            await auth0.loginWithRedirect({
                redirect_uri: "http://localhost:3000/login"
            });
        }
        
        
        
    }
    }catch(e){
    alert(e)
    }
},false);

const configureFirstAuth =async () => {

    let fileData = await fetch("./auth.json");
    const config = await fileData.json();
    
    auth0 = await createAuth0Client({
        domain: config.domain,
        client_id: config.client_id,
        cacheLocation: "localstorage"
    });
}
