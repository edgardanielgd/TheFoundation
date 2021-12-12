
var auth0 = null;
window.addEventListener("load",async () => {
    try{
        await configureCheckAuth();
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

const configureCheckAuth = async () => {
    let fileData = await fetch("./auth.json");
    let data = await fileData.json();
    auth0 = await createAuth0Client({
        domain: data.domain,
        client_id: data.client_id,
        cacheLocation: "localstorage"
    });
}