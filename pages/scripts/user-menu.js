var auth0 = null;
const logout = async () => {
    if(auth0){
        await auth0.logout({
            returnTo: "http://localhost:3000"
        });
    }
}

const getUserInfo = async (user,divElement) => {
    if(user){
        let img = document.createElement("img");
        img.src = user.picture;
        img.width = 50;
        img.height = 50;
        img.onerror = "this.src = 'http://cdn.onlinewebfonts.com/svg/img_76927.png'";

        divElement.appendChild(img);

        let btnLogout = document.createElement("button");
        btnLogout.textContent = "Cerrar Sesión";
        btnLogout.onclick = () => {
            logout();
        };
        let btnMenu = document.createElement("button");
        btnMenu.textContent = "Menú";
        btnMenu.onclick = () => {
            window.location.replace("http://localhost:3000/menu");
        };
        let btnHome = document.createElement("button");
        btnHome.textContent = "HOME";
        btnHome.onclick = () => {
            window.location.replace("http://localhost:3000");
        };

        divElement.appendChild(document.createTextNode(user.name + " ("+ user.nickname + ") "));

        divElement.appendChild(btnHome);
        divElement.appendChild(btnMenu);
        divElement.appendChild(btnLogout);

        
    }
}

const getDefaultLogin = async (divElement) => {
    let p = document.createElement("p");
    p.textContent = "No has iniciado sesión";

    divElement.appendChild(p);
    
    let btnLogin = document.createElement("button");
    btnLogin.textContent = "Iniciar Sesión";
    btnLogin.onclick = () =>{
        window.location.replace("http://localhost:3000/login");
    }
    let btnHome = document.createElement("button");
        btnHome.textContent = "HOME";
        btnHome.onclick = () => {
            window.location.replace("http://localhost:3000");
    };
    divElement.appendChild(btnHome);
    divElement.appendChild(btnLogin);
    
}

const setDivInfo = async(divElement) =>{
    await configureUserPanel();
    try{
        await auth0.checkSession();
        let authenticated = await auth0.isAuthenticated();
        if(!authenticated){
            await getDefaultLogin(divElement);
        }else{
            let user = await auth0.getUser();
            await getUserInfo(user,divElement);
        }
    }catch(e){
            await getDefaultLogin(divElement);
    }
}

window.addEventListener("load",async () => {
    let info = document.getElementById("User");
    if(!info){
        info = document.createElement("div");
        document.body.insertBefore(info,document.body.firstChild);
    }
    
    await setDivInfo(info);
},false);

const configureUserPanel = async () => {
    
    let fileData = await fetch("./auth.json");
    let data = await fileData.json();
    auth0 = await createAuth0Client({
        domain: data.domain,
        client_id: data.client_id,
        cacheLocation: "localstorage"
    });
}