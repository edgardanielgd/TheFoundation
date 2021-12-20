
let renames_data = {
    id : "Id",
    poster_path : "Poster",
    original_title : "Título original",
    revenue : "Ganancia",
    popularity : "Popularidad",
    runtime : "Duración"
}

let DisplayCorrectImage = (objImage,altPoster) => {
    if(altPoster && altPoster != "")
        objImage.src = "https://image.tmdb.org/t/p/original/"+altPoster;
    else{
        objImage.src = "https://image.freepik.com/free-icon/interrogation-mark-circle_318-9651.jpg";
    }
}

let genTable = (data) => {
    
    let displayIframe = document.getElementById("result");
    displayIframe.innerHTML = "";

    if(data.error){
        displayIframe.appendChild(document.createTextNode(data.error));
        return;
    }
    if(data.data){
        //Array of documents
        if(data.data.length > 0){
            let displayTable = document.createElement("table");

            let keys = Object.keys(data.data[0]); //same keys for all objects

            let row = document.createElement("tr");
            for(i in renames_data){
                let ikey = i;
                if(keys.includes(ikey)){
                    let header = document.createElement("th");
                    header.appendChild(document.createTextNode(renames_data[ikey]));
                    row.appendChild(header);
                }
                
            }

            displayTable.appendChild(row);

            for(key in data.data){
                let datarow = data.data[key];
                row = document.createElement("tr");

                for(subkey in renames_data){
                    if(datarow[subkey]){
                        let cell = document.createElement("td");
                        let value =datarow[subkey];
                        let td = "";
                        if(subkey == "poster_path"){
                            td = new Image(50,50);
                            td.src = "https://image.tmdb.org/t/p/original/"+value;
                            td.onerror = () => {
                                DisplayCorrectImage(td,datarow.col_poster_path)
                            }
                        }else{
                            td = document.createTextNode(value);
                        }
                        cell.appendChild(td);
                        row.appendChild(cell);     
                    }
                }
                displayTable.appendChild(row);
            }

            displayIframe.appendChild(displayTable);

        }else{
            displayIframe.appendChild(document.createTextNode("No se encontraron coincidencias"));
            return;
        }
    }else{
        displayIframe.appendChild(document.createTextNode("Imposible generar los datos"));
        return;
    }
}
window.addEventListener("load", async () => {
    let form = document.getElementById("frmBusqueda");
    
    form.addEventListener("submit",function(event){
        event.preventDefault();
        let Data = new FormData(form);

        let xhr = new XMLHttpRequest();

        xhr.onload = function(){
            
                genTable(JSON.parse(xhr.response));
            
        }

        xhr.open("POST","http://localhost:3000/search");

        xhr.send( Data );
    });

});


