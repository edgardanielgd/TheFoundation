(function (window,undefined) {
    const maxCards = 50;
    let renames_data = {
        id : "Id",
        poster_path : "Poster",
        original_title : "Título original",
        revenue : "Ganancia",
        popularity : "Popularidad",
        runtime : "Duración",
        title: "Título",
        genres: "Géneros"
    }
    
    let genTable = (data) => {
        
        let displayDiv = document.getElementById("result");
        displayDiv.innerHTML = "";

        if(data.error){
            Utilities.showErrorMessage(displayDiv,data.error);
            return;
        }
        
        let genresManager = new Utilities.genresManager();

        if(data.data){
            //Array of documents
            if(data.data.length > 0){

                let dbData = data.data;
                
                for(let key in dbData){
                    let col = document.createElement("div");
                    col.className = "col-lg-4 col-md-6 col-sm-12 mt-lg-2 mt-sm-1"

                    let card = document.createElement("div");
                    card.className = "card customCardStyle align-items-center";
                    //Displaying 3 columns on large screens, 2 on medium and 1 on small screens
                    
                    let cBody = document.createElement("div");
                    cBody.className = "card-body customCardBodyStyle";
                    
                    let cFooter = document.createElement("div");
                    cFooter.className = "card-footer";

                    let cBodyGrid = document.createElement("div");
                    cBodyGrid.className = "container";

                    let datarow = dbData[key];
                    
                    for(let subkey in renames_data){
                        if(datarow[subkey]){
                            
                            let value = datarow[subkey];
                            if(subkey == "poster_path"){
                                let cImg = new Image();
                                cImg.className = "card-img-top";
                                cImg.src = "https://image.tmdb.org/t/p/original/"+value;
                                cImg.onerror = () => {
                                    Utilities.DisplayCorrectImage(cImg,datarow.col_poster_path)
                                }
                                card.appendChild(cImg);
                            }else if(subkey == "title"){
                                let cTitle = document.createElement("h5");
                                cTitle.className = "card-title";
                                cTitle.textContent = value;
                                cBody.appendChild(cTitle);
                                //Always title on top
                            }else if(subkey == "genres"){
                                let genres = datarow.genres;
                                if(genres){
                                    for(i in genres){
                                        //Appending all genres with a beautiful style and colors notation
                                        let genre = genres[i];
                                        let span = document.createElement("span");
                                        span.className = "badge " + genresManager.getGenre(genre.name);
                                        span.textContent = genre.name;
                                        cFooter.appendChild(span);
                                    }
                                }
                            }else{
                                let cRow = document.createElement("div");
                                cRow.className = "row";
                                    let cCol = document.createElement("div");
                                    cCol.className = "col-5";
                                        let p = document.createElement("p");
                                        p.className = "card-text";
                                        p.innerHTML = "<b>"+renames_data[subkey]+"</b>";
                                        cCol.appendChild(p);
                                    cRow.appendChild(cCol);
                                    cCol = document.createElement("div");
                                    cCol.className = "col-7";
                                        p = document.createElement("p");
                                        p.className = "card-text";
                                        p.textContent = value;
                                        cCol.appendChild(p);
                                    cRow.appendChild(cCol);
                                cBodyGrid.appendChild(cRow);
                            } 
                        }
                    }
                    cBody.appendChild(cBodyGrid);
                    card.appendChild(cBody);
                    card.appendChild(cFooter);
                    col.appendChild(card);
                    displayDiv.appendChild(col);
                    
                }

            }else{
                Utilities.showErrorMessage(displayDiv,"No se encontraron coincidencias");
                return;
            }
        }else{
            Utilities.showErrorMessage(displayDiv,"Imposible generar los datos");
            return;
        }
    }
    window.addEventListener("load", async () => {
        let form = document.getElementById("frmBusqueda");
        
        form.addEventListener("submit",function(event){
            event.preventDefault();
            
            let Data = new FormData(form);
            Data.append("MaxItems",maxCards);

            let xhr = new XMLHttpRequest();

            xhr.onload = function(){
                
                    genTable(JSON.parse(xhr.response));
                
            }

            xhr.open("POST","http://localhost:3000/search");

            xhr.send( Data );
        });

    });
})(window);


