(function (window, undefined) {
    const maxCards = 50;
    const renames_data = {
      id: "Id",
      poster_path: "Poster",
      original_title: "Título original",
      revenue: "Ganancia",
      popularity: "Popularidad",
      runtime: "Duración",
      title: "Título",
      genres: "Géneros",
      overview: "Resumen",
      homepage: "Página principal",
    };
    const default_projection = {
      _id: 0,
      id: 1,
      poster_path: 1,
      original_title: 1,
      revenue: 1,
      popularity: 1,
      runtime: 1,
      title: 1,
      genres: 1,
      overview: 1,
      col_poster_path: 1,
      homepage: 1,
    };
  
    let genTable = (data) => {
      let displayDiv = document.getElementById("result");
      displayDiv.innerHTML = "";
  
      if (data.error) {
        Utilities.showErrorMessage(displayDiv, data.error);
        return;
      }
  
      let genresManager = new Utilities.genresManager();
  
      if (data.data) {
        //Array of documents
        if (data.data.length > 0) {
          let dbData = data.data;
  
          for (let key in dbData) {
            let col = document.createElement("div");
            col.className = "col-lg-4 col-md-6 col-sm-12 mt-lg-2 mt-sm-1";
  
            let card = document.createElement("div");
            card.className = "card customCardStyle align-items-center";
            //Displaying 3 columns on large screens, 2 on medium and 1 on small screens
  
            let homeLink = null;
  
            let cHeader = document.createElement("div");
            cHeader.className = "card-header";
            
            let cEditButton = document.createElement("button");
            cEditButton.className = "btn btn-warning";
            cEditButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
            <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
          </svg>`;
            
            let cDeleteButton = document.createElement("button");
            cDeleteButton.className = "btn btn-danger ml-3";
            cDeleteButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash-fill" viewBox="0 0 16 16">
            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1H2.5zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5zM8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5zm3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0z"/>
          </svg>`;

            let cPredictButton = document.createElement("button");
            cPredictButton.className = "btn btn-primary ml-3";
            cPredictButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-hourglass-split" viewBox="0 0 16 16">
              <path d="M2.5 15a.5.5 0 1 1 0-1h1v-1a4.5 4.5 0 0 1 2.557-4.06c.29-.139.443-.377.443-.59v-.7c0-.213-.154-.451-.443-.59A4.5 4.5 0 0 1 3.5 3V2h-1a.5.5 0 0 1 0-1h11a.5.5 0 0 1 0 1h-1v1a4.5 4.5 0 0 1-2.557 4.06c-.29.139-.443.377-.443.59v.7c0 .213.154.451.443.59A4.5 4.5 0 0 1 12.5 13v1h1a.5.5 0 0 1 0 1h-11zm2-13v1c0 .537.12 1.045.337 1.5h6.326c.216-.455.337-.963.337-1.5V2h-7zm3 6.35c0 .701-.478 1.236-1.011 1.492A3.5 3.5 0 0 0 4.5 13s.866-1.299 3-1.48V8.35zm1 0v3.17c2.134.181 3 1.48 3 1.48a3.5 3.5 0 0 0-1.989-3.158C8.978 9.586 8.5 9.052 8.5 8.351z"/>
            </svg>`;
            cHeader.appendChild(cEditButton);
            cHeader.appendChild(cDeleteButton);
            cHeader.appendChild(cPredictButton);
  
            let cBody = document.createElement("div");
            cBody.className = "card-body customCardBodyStyle";
  
            let cFooter = document.createElement("div");
            cFooter.className = "card-footer";
  
            let cBodyGrid = document.createElement("div");
            cBodyGrid.className = "container-fluid";
  
            let datarow = dbData[key];
  
            for (let subkey in renames_data) {
              if (datarow[subkey]) {
                let value = datarow[subkey];
                if (subkey == "poster_path") {
                  let cImg = new Image();
                  cImg.className = "card-img-top";
                  if( value.match(/^\//) || value.match(/^\\/))
                    cImg.src = "https://image.tmdb.org/t/p/original/" + value;
                  else
                    cImg.src = value;  
                  
                  cImg.onerror = () => {
                    Utilities.DisplayCorrectImage(cImg, datarow.col_poster_path);
                  };
                  card.appendChild(cImg);
                } else if (subkey == "title") {
                  let cTitle = document.createElement("h5");
                  cTitle.className = "card-title";
                  cTitle.textContent = value;
                  let first = cBody.firstChild;
                  first ? first.before(cTitle) : cBody.appendChild(cTitle);
                  //Always title on top
                } else if (subkey == "genres") {
                  let genres = datarow.genres;
                  if (genres) {
                    for (i in genres) {
                      //Appending all genres with a beautiful style and colors notation
                      let genre = genres[i];
                      let span = document.createElement("span");
                      span.className =
                        "badge " + genresManager.getGenre(genre.name);
                      span.textContent = genre.name;
                      cFooter.appendChild(span);
                    }
                  }
                } else if (subkey == "overview") {
                  let overview = datarow.overview;
                  card.setAttribute("data-toggle", "tooltip");
                  card.setAttribute("title", overview);
                } else if (subkey == "homepage") {
                  homeLink = document.createElement("a");
                  homeLink.href = datarow.homepage;
                  homeLink.target = "_blank";
                  homeLink.className = "btn btn-outline-light mb-2";
                  homeLink.textContent = "Página principal";
                } else if(subkey == "id"){
                  cEditButton.addEventListener("click",(event) => {
                    event.preventDefault();
                    window.open("http://localhost:3000/movies_edit_add?edit=true&id="+ value)
                  });
                  cPredictButton.addEventListener("click",(event) => {
                    event.preventDefault();
                    window.open("http://localhost:3000/predictions?id="+ value)
                  });
                  cDeleteButton.addEventListener("click",(event) => {
                    event.preventDefault();
                    prepareDeletion( value, card );
                  });  
                } else {
                  let cRow = document.createElement("div");
                  cRow.className = "row";
                  let cCol = document.createElement("div");
                  cCol.className = "col-7";
                  let p = document.createElement("p");
                  p.className = "card-text";
                  p.innerHTML = "<b>" + renames_data[subkey] + "</b>";
                  cCol.appendChild(p);
                  cRow.appendChild(cCol);
                  cCol = document.createElement("div");
                  cCol.className = "col-5";
                  p = document.createElement("p");
                  p.className = "card-text";
                  p.textContent = value;
                  cCol.appendChild(p);
                  cRow.appendChild(cCol);
                  cBodyGrid.appendChild(cRow);
                }
              }
            }
            card.appendChild(cHeader);
            cBody.appendChild(cBodyGrid);
  
            card.appendChild(cBody);
            card.appendChild(cFooter);
  
            if (homeLink) card.appendChild(homeLink);
  
            col.appendChild(card);
            displayDiv.appendChild(col);
          }
          var tooltipTriggerList = [].slice.call(
            document.querySelectorAll('[data-toggle="tooltip"]')
          );
          var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
          }); //Enables custom tooltips
        } else {
          showError("No se encontraron coincidencias");
          return;
        }
      } else {
        showError("Imposible generar los datos");
        return;
      }
    };
    window.addEventListener("load", async () => {
      let form = document.getElementById("frmBusqueda");
  
      form.addEventListener("submit", function (event) {
        event.preventDefault();
  
        let Data = new FormData(form);
  
        let jsonRequest = genRequestJson(Data);
        if (!jsonRequest.error) {
          let xhr = new XMLHttpRequest();
  
          xhr.onload = function () {
            if (
              xhr.getResponseHeader("content-type").includes("application/json")
            ) {
              genTable(JSON.parse(xhr.response));
            } else {
              showError("No se obtuvo una respuesta valida");
            }
          };
  
          xhr.open("POST", "http://localhost:3000/api_v1/movies/");
  
          xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");
  
          xhr.send(JSON.stringify(jsonRequest));
        }
      });

      const addButton = document.getElementById("btnAdd");
      addButton.addEventListener("click", (event) => {
          event.preventDefault();
          window.open("http://localhost:3000/movies_edit_add?edit=false","_blank").focus();
      })
    });
  
    genRequestJson = (frmData) => {
      let jsonRequest = {};
      let query = {};
      let sort = {};
      const type = frmData.get("Tipo");
      const value = frmData.get("Valor");
      const min = frmData.get("Min");
      const max = frmData.get("Max");
      const orderType = frmData.get("Orden");
      switch (type) {
        case "1": {
          if (!value) {
            showError("Digite datos correctos");
            return;
          }
          query["id"] = value;
          break;
        }
        case "2": {
          if (!value) {
            showError("Digite datos correctos");
            return;
          }
          query["original_title"] = value;
          break;
        }
        case "3": {
          if (!min || !max) {
            showError("Digite datos correctos");
            return;
          }
          query["popularity_min"] = min;
          query["popularity_max"] = max;
          break;
        }
        case "4": {
          if (!min || !max) {
            showError("Digite datos correctos");
            return;
          }
          query["runtime_min"] = min;
          query["runtime_max"] = max;
          break;
        }
        case "5": {
          if (!value) {
            showError("Digite datos correctos");
            return;
          }
          query["title"] = value;
          break;
        }
        case "6": {
          if (!value) {
            showError("Digite datos correctos");
            return;
          }
          query["genreMatch"] = value;
          break;
        }
        case "7": {
          if (!value) {
            showError("Digite datos correctos");
            return;
          }
          query["keywordMatch"] = value;
          break;
        }
        case "8": {
          if (!value) {
            showError("Digite datos correctos");
            return;
          }
          query["languageMatch"] = value;
          break;
        }
        default: {
          showError("Formulario inválido");
          return {
            error: true,
          };
        }
      }
  
      switch (orderType) {
        case "1": {
          sort = {
            id: 1,
          };
          break;
        }
        case "2": {
          sort = {
            id: -1,
          };
          break;
        }
        case "3": {
          sort = {
            title: 1,
          };
          break;
        }
        case "4": {
          sort = {
            title: -1,
          };
          break;
        }
      }
      jsonRequest["query"] = query;
      jsonRequest["sort"] = sort;
      jsonRequest["projection"] = default_projection;
      jsonRequest["limit"] = maxCards;
  
      return jsonRequest;
    };

    showError = (message) => {
      let displayDiv = document.getElementById("result");
      Utilities.showErrorMessage(displayDiv, message);
    };

    prepareDeletion = (id, card) => {
      const confirmation = confirm("¿Seguro que desea borrar la película?");
      if( confirmation ){

        const xhr = new XMLHttpRequest();
        xhr.onload = function () {
          if (
            xhr.getResponseHeader("content-type").includes("application/json")
          ) {
            card.remove();
          }
        };

        xhr.open("DELETE", "http://localhost:3000/api_v1/movies/" + id);

        xhr.setRequestHeader("Content-type", "application/json; charset=utf-8");

        xhr.send();
      }
    }

  })(window);