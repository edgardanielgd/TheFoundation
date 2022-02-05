(function (window,undefined) {
    const rename_data = {
        title: "Título",
        budget: "Presupuesto",
        popularity: "Popularidad",
        runtime: "Duración"
    }
    window.addEventListener("load", async () => {
        let id = getId();
        if( id ){
            let xhr = new XMLHttpRequest();
            
            xhr.onload = function(){
                if( xhr.getResponseHeader("content-type").includes("application/json")){
                    const response = JSON.parse(xhr.response);
                    if( response.error ){
                        showError( response.error );
                    }else{
                        let displayDiv = document.getElementById("result");
                        displayDiv.innerHTML = "";

                        let divInfo = document.createElement("div");
                        divInfo.className = "alert alert-success";

                        let info = "Se estima que ésta pelicula genere ingresos de: " + response.data +"<br>" +
                        "Datos de entrada: <br>"
                        for( field in response){
                            if( field == "data")continue;
                            let beauty_name = field;
                            if( rename_data[field] ) beauty_name = rename_data[field];
                            info += "<b>" + beauty_name + "</b> : " + response[field] + "<br>";
                        }
                        divInfo.innerHTML = info;
                        displayDiv.appendChild( divInfo );
                    }
                }else{
                    showError("No se obtuvo una respuesta valida");
                }
                
            }

            xhr.open("GET","http://localhost:3000/api_v1/moviesPredictions/" + id);

            xhr.setRequestHeader("Content-type","application/json; charset=utf-8");

            xhr.send();
        }else{
            showError( "Invalid data" );
        }

    });

    getId = () => {
        const url = new URL(window.location.href);
        const id = url.searchParams.get("id");
        return id;
    }
    showError = (message) => {
        let displayDiv = document.getElementById("result");
        Utilities.showErrorMessage(displayDiv,message);
    }
})(window);


