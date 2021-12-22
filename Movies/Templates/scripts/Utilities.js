(function (window,undefined) {
    const DisplayCorrectImage = (objImage,altPoster) => {
        if(altPoster && altPoster != "")
            objImage.src = "https://image.tmdb.org/t/p/original/"+altPoster;
        else{
            objImage.src = "https://cdn.pixabay.com/photo/2018/08/07/16/03/cinema-3590128_1280.jpg";
        }
    }

    const showErrorMessage = (displayDiv,message) => {
        let divAlert = document.createElement("div");
        divAlert.className = "alert alert-danger";
        divAlert.innerHTML = "<b>"+message+"</b>";
        displayDiv.appendChild(divAlert);
    }

    const configureAuth = async () => {

        let fileData = await fetch("./auth.json");
        let config = await fileData.json();
        
        let auth0 = await createAuth0Client({
            domain: config.domain,
            client_id: config.client_id,
            cacheLocation: "localstorage"
        });

        return auth0;
    }
    window.Utilities = {
        DisplayCorrectImage : DisplayCorrectImage,
        showErrorMessage : showErrorMessage,
        configureAuth : configureAuth
    }
})(window)