// Manage-MPM = Manage-Most-Popular-Movies
(function (window,undefined) {
    const cardsPerItem = 3;
    const maxCards = 12;

    let renames_data = {
        poster_path : "Poster",
        title : "Título"
    }

    let genCarousel = (data) => {
        let displayDiv = document.getElementById("divMPM");
        displayDiv.innerHTML = "";

        let itemsCount = 0;
        if(data.error){
            Utilities.showErrorMessage(displayDiv,data.error);
            return;
        }
        if(data.data){
            //Array of documents
            if(data.data.length > 0){

                let dbData = data.data;
                let row = document.createElement("div");
                row.className = "row carousel-item active"; //First item is the one active
                displayDiv.appendChild(row);

                for(let key in dbData){
                    let col = document.createElement("div");
                    col.className = "col-lg-4 col-md-6 col-sm-12 carouselCustom";

                    let card = document.createElement("div");
                    card.className = 
                    "card customCardStyle align-items-center";
                    //Displaying 3 columns on large screens, 2 on medium and 1 on small screens
                    
                    let cBody = document.createElement("div");
                    cBody.className = "card-body customCardBodyStyle";

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
                    col.appendChild(card);

                    if(itemsCount % cardsPerItem == 0){ //A new item for carousel
                        if(itemsCount !== 0){
                            row = document.createElement("div");
                            row.className = "row carousel-item";
                            displayDiv.appendChild(row);
                        }
                    }
                    row.appendChild(col);
                    itemsCount += 1;
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
        
        let xhr = new XMLHttpRequest();

        let data = new FormData();
        data.append("MaxItems",maxCards);

        xhr.onload = function(){
            genCarousel(JSON.parse(xhr.response));       
        }

        xhr.open("POST","http://localhost:3000/popularQuery");

        xhr.send(data);

    });
})(window)