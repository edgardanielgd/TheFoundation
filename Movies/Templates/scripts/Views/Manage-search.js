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
          cHeader.appendChild(cEditButton);

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
                cImg.src = "https://image.tmdb.org/t/p/original/" + value;
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
})(window);
