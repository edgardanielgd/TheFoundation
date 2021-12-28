(function (window,undefined) {
    var auth0 = null;

    let profile_info_fields = {
        given_name : "Nombres",
        family_name : "Apellidos",
        nickname: "Apodo",
        name:"Nombre Completo",
        picture: "Imagen",
        locale: "Idioma",
        updated_at:"Última actualización",
        email:"e-mail",
        email_verified:"¿Email verificado?"
    }
    const logout = async () => {
        if(auth0){
            await auth0.logout({
                returnTo: "http://localhost:3000"
            });
        }
    }

    const getUserInfo = async (user,divElement,ul,roles) => {
        if(user){
            //Adding components to menú
            let menuli = document.createElement("li");
            menuli.className = "nav-item";

                let a = document.createElement("a");
                a.className = "nav-link";
                a.href = "http://localhost:3000/menu";
                a.textContent = "Menú de películas";
                menuli.appendChild(a);

                ul.appendChild(menuli);
            
            if(roles.includes("Administrator")){
                //Append special menu options for admins
                let statsli = document.createElement("li");
                statsli.className = "nav-item";
                    let aStats = document.createElement("a");
                    aStats.className = "nav-link";
                    aStats.href = "#";
                    aStats.textContent = "Estadísticas";
                    statsli.appendChild(aStats);

                    ul.appendChild(statsli);
            }
            let authSection = document.createElement("div");
            authSection.className = "ml-auto";

                let img = document.createElement("img");
                img.className = "rounded-circle";
                img.id = "user_picture";
                img.alt = "User profile picture";
                img.src = user.picture;
                img.onerror = () => {
                    img.src="http://cdn.onlinewebfonts.com/svg/img_76927.png";
                }
                authSection.appendChild(img);

                let li = document.createElement("li");
                li.className = "navbar-text ml-3";
                li.textContent =user.name + " ("+ user.nickname + ") ";
                authSection.appendChild(li);

                
                let btnProfile = document.createElement("button");
                btnProfile.className = "btn btn-primary ml-3";
                btnProfile.textContent = "Perfil";
                //Aditional configurations at the end of current function definition
                
                authSection.appendChild(btnProfile);

                let btnLogout = document.createElement("button");
                btnLogout.className = "btn btn-danger ml-3";
                btnLogout.textContent = "Cerrar Sesión";
                btnLogout.onclick = () => {
                    logout();
                };
                authSection.appendChild(btnLogout);

            divElement.appendChild(authSection);
            

            //Adding modal frame displayed when clicking "Profile"
            
            let modalDiv = document.createElement("div");
            modalDiv.className = "modal fade";
            modalDiv.id = "ProfileModal";
            modalDiv.tabindex = -1;
            modalDiv.setAttribute("role","dialog");
            modalDiv.setAttribute("aria-labelledby","ProfileModalLabel");
            modalDiv.setAttribute("aria-hidden","true");
            
                let doc = document.createElement("div");
                doc.className = "modal-dialog";
                doc.setAttribute("role","document");
                
                    let content = document.createElement("div");
                    content.className = "modal-content";
                    
                        let headerDiv = document.createElement("div");
                        headerDiv.className = "modal-header";
                        
                            let title = document.createElement("h5");
                            title.className = "modal-title";
                            title.id = "ProfileModalLabel";
                            title.textContent = "Perfil de: "+user.name;
                            headerDiv.appendChild(title);

                            let btnClose = document.createElement("button");
                            btnClose.type = "button";
                            btnClose.className = "close";
                            btnClose.setAttribute("data-dismiss","modal");
                            btnClose.setAttribute("aria-label","Close");
                                let spnClose = document.createElement("span");
                                spnClose.setAttribute("aria-hidden","true");
                                spnClose.textContent = "x";
                                btnClose.appendChild(spnClose);
                            headerDiv.appendChild(btnClose);                                       
                        content.appendChild(headerDiv);
                        
                        let divBody = document.createElement("div");
                        divBody.className = "modal-body";
                            let divContain = document.createElement("div");
                            divContain.className = "container";
                                for(i in user){
                                    if(profile_info_fields[i]){
                                        let row = document.createElement("div");
                                        row.className = "row mr-auto";
                                            let colKey = document.createElement("div");
                                            colKey.className = "col";
                                            colKey.textContent = profile_info_fields[i];
                                            row.appendChild(colKey);

                                            let colValue = document.createElement("div");
                                            colValue.className = "col";
                                                if(i == "picture"){
                                                    let imgPic = document.createElement("img");
                                                    imgPic.className = "img-fluid";
                                                    //imgPic.id = "profile_info_picture";
                                                    imgPic.alt = "User profile picture";
                                                    imgPic.src = user[i];
                                                    imgPic.onerror = () => {
                                                        imgPic.src="http://cdn.onlinewebfonts.com/svg/img_76927.png";
                                                    }
                                                    colValue.appendChild(imgPic);
                                                }else{
                                                    let p = document.createElement("p");
                                                    p.className = "text-justify";
                                                    p.textContent = user[i] || "N/A";
                                                    colValue.appendChild(p);
                                                }
                                                
                                            row.appendChild(colValue);

                                        divContain.appendChild(row);
                                    }
                                }
                                
                            divBody.appendChild(divContain);
                        content.appendChild(divBody);
                        
                        let divFooter = document.createElement("div");
                        divFooter.className = "modal-footer";
                            let btnClose2 = document.createElement("button");
                            btnClose2.type = "button";
                            btnClose2.className = "btn btn-dark";
                            btnClose2.setAttribute("data-dismiss","modal");
                            btnClose2.textContent = "Cerrar";
                            divFooter.appendChild(btnClose2);
                        content.appendChild(divFooter);

                    doc.appendChild(content);
                modalDiv.appendChild(doc);
            document.body.insertBefore(modalDiv,document.body.firstChild);

            //Configuring profile button
            btnProfile.setAttribute("data-toggle","modal");
            btnProfile.setAttribute("data-target","#ProfileModal");
                
        }
    }

    const getDefaultLogin = async (divElement) => {
        
        let authSection = document.createElement("div");
        authSection.className = "ml-auto";
            
            let li = document.createElement("li");
            li.className = "navbar-text";
            li.textContent ="Aún no has ingresado";
            authSection.appendChild(li);

            let btnLogin = document.createElement("button");
            btnLogin.className = "btn btn-success ml-3";
            btnLogin.textContent = "Iniciar Sesión";
            btnLogin.onclick = () =>{
            window.location.replace("http://localhost:3000/login");
            }
            authSection.appendChild(btnLogin);
            
        divElement.appendChild(authSection);
        
    }

    const setDivInfo = async(divElement) =>{
        
        auth0 = (await Utilities.configureAuth());

        let logo = document.createElement("a");
        logo.className = "navbar-brand";
        logo.href = "http://localhost:3000";

            let logo_image = document.createElement("img");
            logo_image.src = "../Movies/Templates/assets/images/Logo.png";
            logo_image.alt = "The Foundation logo";
            logo_image.id = "logo_Foundation";

            logo.appendChild(logo_image);

        divElement.appendChild(logo);

        let togglerButton = document.createElement("button");
        togglerButton.className = "navbar-toggler";
        togglerButton.type = "button";
        togglerButton.setAttribute("data-toggle","collapse");
        togglerButton.setAttribute("data-target","#navbar");
        togglerButton.setAttribute("aria-controls","navbar");
        togglerButton.setAttribute("aria-expanded","false");
        togglerButton.setAttribute("aria-label","Toggle navigation");

            let span = document.createElement("span");
            span.className = "navbar-toggler-icon";
            togglerButton.appendChild(span);
        
        divElement.appendChild(togglerButton);

        let divCollapse = document.createElement("div");
        divCollapse.className = "collapse navbar-collapse";
        divCollapse.id = "navbar";

            let ul = document.createElement("ul");
            ul.className = "navbar-nav mr-auto";

                let li = document.createElement("li");
                li.className = "nav-item";

                    let a = document.createElement("a");
                    a.className = "nav-link";
                    a.href = "http://localhost:3000";
                    a.textContent = "Página principal";
                    li.appendChild(a);

                ul.appendChild(li);

            divCollapse.appendChild(ul);
            
        try{
            document.cookie = "access_token = ''"; //Reseting cookie trick value
            await auth0.checkSession();
            let authenticated = await auth0.isAuthenticated();
            if(!authenticated){
                await getDefaultLogin(divCollapse);
            }else{
                let user = await auth0.getUser();
                let token = await auth0.getTokenSilently();
                let roles = await Utilities.getRoles(auth0);
                //Setting a cookie will allow server to identify and get user's authentication state
                document.cookie = "access_token = " + token;
                await getUserInfo(user,divCollapse,ul,roles);
                //ul for adding more options on menu
            }
        }catch(e){
                console.log(e);
                await getDefaultLogin(divCollapse);
        }

        divElement.appendChild(divCollapse);
    }

    window.addEventListener("load",async () => {
        let menu = document.getElementById("User-nav");
        if(!menu){
            menu = document.createElement("nav");
            menu.id = "User-nav";
            
            menu.className = "navbar navbar-expand-lg navbar-dark bg-dark";
            
            let content = document.createElement("div");
            content.className = "container-fluid";

            menu.appendChild(content);

            await setDivInfo(content);
            
            document.body.insertBefore(menu,document.body.firstChild);
        }
    },false);

    async function getRoles(token,userId){
        
        /*let xhr = new XMLHttpRequest();

        xhr.open("GET","https://dev-kftlzjxq.us.auth0.com/api/v2/users/"+userId+"/permissions");

        
        xhr.setRequestHeader("Authorization","Bearer "+token);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.setRequestHeader("Audience","https://TheFoundation.com/api");
        xhr.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
        

        xhr.onload = function(){
            alert(xhr.responseText);
        }
        xhr.onerror = function(){
            alert(xhr.response);
        }

        
        xhr.send();*/

        const response = 
            await fetch("https://dev-kftlzjxq.us.auth0.com/api/v2/users/"+userId+"/roles",{
                "method":"GET",
                "mode": "no-cors",
                "headers":{
                    "Authorization":"Bearer "+token,
                    'Access-Control-Allow-Origin': 'http://localhost:3000'
                }
            });
            alert(response);
    }    

})(window);
