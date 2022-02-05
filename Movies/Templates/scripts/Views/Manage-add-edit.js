(function (window,undefined) {
    const listed_genres = {};
    const listed_companies = {};
    let editing = false;
    let entry = null;
    let max_genre_id = 0;
    let max_company_id = 0;
    
    const setDivInfo = ( requestObject, div, type) => {
        
        requestObject.onload = function(){
            if( requestObject.getResponseHeader("content-type").includes("application/json")){
                const response = JSON.parse(requestObject.response);
                let entry_genres = {};
                let entry_companies = {};
                if( editing ){
                    for(const entry_genre of entry.genres){
                        entry_genres[ entry_genre.id] = true;
                    }
                    for(const entry_company of entry.production_companies){
                        entry_companies[ entry_company.id] = true;
                    }
                }
                if( response.data ){
                    for( const genre of response.data){
                        const {id, name} = genre._id;
                        if( !name || !id)continue;
                        
                        if( type == "genre"){
                            if( id > max_genre_id) max_genre_id = id;
                            listed_genres[id] = {id, name};
                        }else if(type == "company"){
                            if( id > max_company_id) max_company_id = id;
                            listed_companies[id] = {id, name};
                        }
                        
                        const new_option = document.createElement( "option" );
                        const chkId = "opt" + id + "_" + name
                        new_option.id = chkId;
                        new_option.value = id;
                        new_option.innerHTML = name;

                        if( editing && entry_genres[id] && type == "genre"){
                            new_option.selected = true;
                        }
                        if( editing && entry_companies[id] && type == "company"){
                            new_option.selected = true;
                        }

                        div.appendChild( new_option );
                    }
                }
            }
            
        }
    }

    addGenre = () => {

        const div = document.getElementById( "grpGenres" );
        const name = document.getElementById("txtNewGenre").value;
        const new_option = document.createElement( "option" );
        const chkId = "chk" + ++max_genre_id + "_" + name;
        new_option.id = chkId;
        new_option.value = max_genre_id;
        new_option.innerHTML = name;
        new_option.selected = true;
        listed_genres[ max_genre_id ] = { max_genre_id, name };


        div.appendChild( new_option );
    }

    addCompany = () => {

        const div = document.getElementById( "grpCompanies" );
        const name = document.getElementById("txtNewCompany").value;
        const new_option = document.createElement( "option" );
        const chkId = "chk" + ++max_company_id + "_" + name
        new_option.id = chkId;
        new_option.value = max_company_id;
        new_option.innerHTML = name;
        new_option.selected = true;
        listed_companies[ max_company_id ] = { max_company_id, name };

        div.appendChild( new_option );
    }

    window.addEventListener("load", async () => {
        const url = new URL(window.location.href);
        const edit_param = url.searchParams.get("edit");
        const edit_id = parseInt(url.searchParams.get("id"));
        const frmAgregar = document.getElementById("frmAgregar");

        if( edit_param && edit_param === "true" && edit_id && !isNaN(edit_id)){
            editing = true;
            document.getElementById("current_operation").innerHTML = "Estás editando una película";
        }
        if( editing ){
            entry = await getDocument( edit_id );
            if( !entry || entry.error ){
                alert("No se pudieron obtener los datos para la película");
                window.location.replace("http://localhost:3000");
                return;
            }

            document.getElementById("txtTitle").value = entry.title;
            document.getElementById("txtOriginalTitle").value = entry.original_title;
            document.getElementById("txtOverview").value = entry.overview;
            document.getElementById("nbrRuntime").value = parseInt(entry.runtime);
            document.getElementById("nbrBudget").value = parseInt(entry.budget);
            document.getElementById("txtTagline").value = entry.tagline;
            const date = new Date( entry.release_date );
            document.getElementById("datRelease").value = date.toISOString().split("T")[0];
            if( entry.poster_path.match(/^\//) ){
                document.getElementById("urlPoster").value =
                "https://image.tmdb.org/t/p/original/" + entry.poster_path;
            }else{
                document.getElementById("urlPoster").value = entry.poster_path;
            }
            
            document.getElementById("urlHomepage").value = entry.homepage;
        }
        

        const xhrGenres = new XMLHttpRequest();
        const xhrCompanies = new XMLHttpRequest();
        const genresDiv = document.getElementById( "grpGenres" );
        const companiesDiv = document.getElementById( "grpCompanies" );
        
        setDivInfo( xhrGenres, genresDiv, "genre");
        setDivInfo( xhrCompanies, companiesDiv, "company");
        xhrGenres.open("POST","http://localhost:3000/api_v1/movies/");
        
        xhrGenres.setRequestHeader("Content-type","application/json; charset=utf-8");

        xhrGenres.send(
            JSON.stringify({
                group_by: {
                    group_field: "genres",
                    group_unwind: true,
                    group_expressions: {
                        frequency: {
                            $sum: 1
                        }
                    }
                },
                projection: {
                    _id: 1,
                    frequency: 1
                },
                sort: {
                    frequency: 1
                },
                limit: 10000
            })
        );

        xhrCompanies.open("POST","http://localhost:3000/api_v1/movies/");
        
        xhrCompanies.setRequestHeader("Content-type","application/json; charset=utf-8");

        xhrCompanies.send(
            JSON.stringify({
                group_by: {
                    group_field: "production_companies",
                    group_unwind: true,
                    group_expressions: {
                        frequency: {
                            $sum: 1
                        }
                    }
                },
                projection: {
                    _id: 1,
                    frequency: 1
                },
                sort: {
                    frequency: 1
                },
                limit: 100000
            })
        );
        
        frmAgregar.addEventListener("submit", (event) => {
            event.preventDefault();

            const confirmation = confirm("¿Seguro de que desea "+ 
                ((editing) ? "editar" : "agregar")+ " la información?");
            const formData = new FormData( frmAgregar );
            const jsonData = validateAndGenerate( formData );

            const opXHR = new XMLHttpRequest();
            
            opXHR.onload = function(){
                if( opXHR.getResponseHeader("content-type").includes("application/json")){
                    const response = JSON.parse(opXHR.response);
                    
                    if( response.error ){
                        if( response.error.details && response.error.details.length > 0){
                            for(let i = 0; i < response.error.details.length; i++){
                                showMessage( 0, JSON.stringify(response.error.details[i].message));
                            }
                        }else{
                            showMessage( 1, JSON.stringify(response.error));
                        }
                        
                    }else if( response.success ){
                        showMessage( 1, response.success);
                    }
                }
            }
            if( editing ){
                opXHR.open("PATCH","http://localhost:3000/api_v1/movies/" + entry.id);
                opXHR.setRequestHeader("Content-type","application/json; charset=utf-8");
                opXHR.send(
                    JSON.stringify( {
                        updated_document: jsonData 
                    })
                )
            }else{
                opXHR.open("POST","http://localhost:3000/api_v1/movies/");
                opXHR.setRequestHeader("Content-type","application/json; charset=utf-8");
                opXHR.send(
                    JSON.stringify( {
                        new_document: jsonData 
                    })
                )
            }
            
            

        });
        
    });
    const getDocument = ( searchID ) => {
        return new Promise( (resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST","http://localhost:3000/api_v1/movies/");
            
            xhr.setRequestHeader("Content-type","application/json; charset=utf-8");
            xhr.onload = function(){
                if( xhr.getResponseHeader("content-type").includes("application/json")){
                    const response = JSON.parse(xhr.response);
                    if( !response.data){
                        resolve( response );
                        return
                    }
                    if( response.data.length == 0){
                        resolve({
                            error: "No data matched"
                        });
                        return;
                    }
                    resolve({
                        ...response.data[0]
                    });                   
                }
            }
            xhr.send(
                JSON.stringify({
                    query: {
                        id: searchID
                        },
                    projection: {
                        _id: 0,
                        id:1,
                        title: 1,
                        original_title: 1,
                        genres: 1,
                        overview: 1,
                        production_companies: 1,
                        release_date: 1,
                        belongs_to_collection: 1,
                        budget: 1,
                        homepage: 1,
                        popularity: 1,
                        poster_path: 1,
                        tagline: 1,
                        runtime: 1
                        },
                    limit: 1
                    })
                )
        });
    }
    const validateAndGenerate = ( data ) => {
        let title = data.get( "title" );
        let original_title = data.get( "OTitle" );
        let overview = data.get( "overview" );
        let runtime = data.get( "runtime" );
        let budget = data.get( "budget" );
        let tagline = data.get( "tagline" );
        let release_date = data.get( "releaseDate" );
        let poster_path = data.get( "posterPath" );
        let homepage = data.get( "homepagePath" );

        if ( !title ) title = "";
        if ( !original_title ) original_title = "";
        if ( !overview ) overview = "";
        if ( !runtime ) runtime = "";
        if ( !budget ) budget = "";
        if ( !tagline ) tagline = "";
        if ( !release_date ) release_date = "";
        if ( !poster_path ) poster_path = "";
        if ( !homepage ) homepage = "";
        
        const genres = [];
        const production_companies = [];

        const genresDiv = document.getElementById( "grpGenres" );
        const companiesDiv = document.getElementById( "grpCompanies" );

        for( const option of genresDiv.selectedOptions ){
            const value = listed_genres[ option.value ];
            if( value )
                genres.push( value );
        }
        for( const option of companiesDiv.selectedOptions ){
            const value = listed_genres[ option.value ];
            if( value )
            production_companies.push( value );
        }

        const jsonData = {
            title, original_title, overview, runtime, budget, tagline, 
            release_date, poster_path, homepage, genres, production_companies
        };
        return jsonData;
        
    }

    const showMessage = (type, text) => {
        const displayDiv = document.getElementById("result");
        displayDiv.innerHTML = "";
        const message = document.createElement("div");
        if( type ){
            message.className = "alert alert-success";
        }else{
            message.className = "alert alert-danger";
            
        }
        message.innerHTML = text;
        displayDiv.appendChild( message );
    }
    
    
})(window);


