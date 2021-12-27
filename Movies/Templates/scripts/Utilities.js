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
            audience: config.audience,
            cacheLocation: "localstorage"
        });
        return auth0;
    }
    badges_styles = [
            "badge-primary",
            "badge-secondary",
            "badge-success",
            "badge-danger",
            "badge-warning",
            "badge-info",
            "badge-light",
            "badge-dark",
        ]
    class GenresNBadges{
        constructor(){
            this.cursor = 0;
            this.genresStyles = {};
        }
        getGenre = (genreName) => {
            if( !this.genresStyles[genreName] ){
                if(badges_styles.length == this.cursor){
                    //Repeat styles again
                    this.cursor = 0;
                }
                this.genresStyles[genreName] = badges_styles[this.cursor++];
            }
            return this.genresStyles[genreName];
        }
        
    }
    
    window.Utilities = {
        DisplayCorrectImage : DisplayCorrectImage,
        showErrorMessage : showErrorMessage,
        configureAuth : configureAuth,
        genresManager : GenresNBadges
    }
})(window)