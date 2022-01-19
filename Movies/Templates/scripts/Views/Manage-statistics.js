var current_chart_code = 1;
var charts_loaded = false;
var colors = [];
const maxElements = 10;

const queryData = ( options ) => {
    return new Promise( (resolve, reject) => {
        let xhr = new XMLHttpRequest();
                    
        xhr.onload = function(){
            if( xhr.getResponseHeader("content-type").includes("application/json")){
                resolve({
                    data: JSON.parse(xhr.response)
                });
            }else{
                resolve({
                    error: "No se obtuvo una respuesta valida"
                });
            }
        }

        xhr.addEventListener("error", (e) => {
            resolve({
                error: e.message
            });
        })

        xhr.open("POST","http://localhost:3000/api_v1/movies/");

        xhr.setRequestHeader("Content-type","application/json; charset=utf-8");

        xhr.send(
            JSON.stringify(options)
        );
    });
}
var graphData = null;

const updateCurrentChart = ( updateData = false) => {
    if( ! charts_loaded ) return;
    if( updateData ) colors= [];
    switch( current_chart_code ){
        case 1: {
            updateGenresGraph( updateData );
            break;
        }
        case 2:{
            updateCompaniesGraph( updateData );
            break;
        }
        case 3:{
            updateLanguagesGraph( updateData );
            break;
        }
        case 4:{
            updatePopularGenresGraph( updateData );
            break;
        }
        case 5:{
            updateRuntimeGraph( updateData );
            break;
        }
        case 6:{
            updateKeywordsGraph( updateData );
            break;
        }
    }
}
const updateGenresGraph = async ( updateData = false) => {
    if( !graphData || updateData){
        responseData = await queryData({
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
                frequency: -1
            },
            limit: maxElements
        });

        if( responseData.error || ! responseData.data || ! responseData.data.data) return;

        graphData = responseData.data.data;
    }
    
    let dataArray = [
        [ "Genre" , "Frecuencia", { role: "style"}]
    ];   
    for( let i = 0; i < graphData.length; i ++){
        
        let color;
        if( colors[i] )
            color = colors[i];
        else{
            color = "#" + Math.floor(Math.random()*16777215).toString(16);
            colors.push( color );
        }
        let value = graphData[i];
        dataArray.push(
            [ (value._id.name) ? (value._id.name) : "Indefinido",
              value.frequency, 
              color
            ]
        ) 
    }
    const dataTable = new google.visualization.arrayToDataTable(
        dataArray
    );
    const dataView = new google.visualization.DataView(dataTable);
    dataView.setColumns([ 0, 1, {
        calc: "stringify",
        sourceColumn: 1,
        type: "string",
        role: "annotation"
    }, 2]);

    let options = {
        title:'Frecuencia por género',
        bar:{
            groupWidth: "95%"
        },
        legend:{
            position: "none"
        }
    };
    let chart = new google.visualization.BarChart(
        document.getElementById("GenresChart")
    )
    google.visualization.events.addListener(chart, 'ready', function () {
        document.getElementById("DownloadLink").href = chart.getImageURI();
    });
    chart.draw( dataView, options);
}
const updateCompaniesGraph = async ( updateData = false) => {
    if( !graphData || updateData){
        responseData = await queryData({
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
                frequency: -1
            },
            limit: maxElements
        });

        if( responseData.error || ! responseData.data || ! responseData.data.data) return;

        graphData = responseData.data.data;
    }
    
    let dataArray = [
        [ "Company" , "Frecuencia", { role: "style"}]
    ];
  
    for( let i = 0; i < graphData.length; i ++){
        
        let color;
        if( colors[i] )
            color = colors[i];
        else{
            color = "#" + Math.floor(Math.random()*16777215).toString(16);
            colors.push( color );
        }
        let value = graphData[i];
        dataArray.push(
            [ (value._id.name) ? (value._id.name) : "Indefinido",
              value.frequency, 
              color
            ]
        ) 
    }
    const dataTable = new google.visualization.arrayToDataTable(
        dataArray
    );
    const dataView = new google.visualization.DataView(dataTable);
    dataView.setColumns([ 0, 1, {
        calc: "stringify",
        sourceColumn: 1,
        type: "string",
        role: "annotation"
    }, 2]);

    let options = {
        title:'Frecuencia por compañía productora',
        bar:{
            groupWidth: "95%"
        },
        legend:{
            position: "none"
        }
    };
    let chart = new google.visualization.BarChart(
        document.getElementById("CompaniesChart")
    )
    google.visualization.events.addListener(chart, 'ready', function () {
        document.getElementById("DownloadLink").href = chart.getImageURI();
    });
    chart.draw( dataView, options);
}
const updateLanguagesGraph = async ( updateData = false) => {
    if( !graphData || updateData){
        responseData = await queryData({
            group_by: {
                group_field: "spoken_languages",
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
                frequency: -1
            },
            limit: maxElements
        });

        if( responseData.error || ! responseData.data || ! responseData.data.data) return;

        graphData = responseData.data.data;
    }
    
    let dataArray = [
        [ "Language" , "Frecuencia", { role: "style"}]
    ];
 
    for( let i = 0; i < graphData.length; i ++){
        
        let color;
        if( colors[i] )
            color = colors[i];
        else{
            color = "#" + Math.floor(Math.random()*16777215).toString(16);
            colors.push( color );
        }
        let value = graphData[i];
        dataArray.push(
            [ (value._id.name) ? (value._id.name) : "Indefinido",
              value.frequency, 
              color
            ]
        ) 
    }
    const dataTable = new google.visualization.arrayToDataTable(
        dataArray
    );
    const dataView = new google.visualization.DataView(dataTable);
    dataView.setColumns([ 0, 1, {
        calc: "stringify",
        sourceColumn: 1,
        type: "string",
        role: "annotation"
    }, 2]);

    let options = {
        title:'Frecuencia por lenguaje hablado',
        is3D: true
    };
    let chart = new google.visualization.PieChart(
        document.getElementById("LanguagesChart")
    )
    google.visualization.events.addListener(chart, 'ready', function () {
        document.getElementById("DownloadLink").href = chart.getImageURI();
    });
    chart.draw( dataView, options);
}
const updatePopularGenresGraph = async ( updateData = false) => {
    if( !graphData || updateData){
        responseData = await queryData({
            group_by: {
                group_field: "genres",
                group_unwind: true,
                group_expressions: {
                    average_popularity: {
                        $avg: {
                            $convert: {
                                input: "$popularity", to: "decimal"
                            }
                        }
                    }
                }
            },
            projection: {
                _id: 1,
                average_popularity: 1
            },
            sort: {
                average_popularity: -1
            },
            limit: maxElements
        });

        if( responseData.error || ! responseData.data || ! responseData.data.data) return;

        graphData = responseData.data.data;
    }
    
    let dataArray = [
        [ "Genre" , "Promedio de calificación", { role: "style"}]
    ];

    for( let i = 0; i < graphData.length; i ++){
        
        let color;
        if( colors[i] )
            color = colors[i];
        else{
            color = "#" + Math.floor(Math.random()*16777215).toString(16);
            colors.push( color );
        }
        let value = graphData[i];
        dataArray.push(
            [ (value._id.name) ? (value._id.name) : "Indefinido",
              parseFloat(value.average_popularity.$numberDecimal), 
              color
            ]
        ) 
    }
    const dataTable = new google.visualization.arrayToDataTable(
        dataArray
    );
    const dataView = new google.visualization.DataView(dataTable);
    dataView.setColumns([ 0, 1, {
        calc: "stringify",
        sourceColumn: 1,
        type: "string",
        role: "annotation"
    }, 2]);

    let options = {
        title:'Promedio de popularidad por género',
        bar:{
            groupWidth: "95%"
        },
        legend:{
            position: "none"
        }
    };
    let chart = new google.visualization.BarChart(
        document.getElementById("PopularGenresChart")
    )
    google.visualization.events.addListener(chart, 'ready', function () {
        document.getElementById("DownloadLink").href = chart.getImageURI();
    });
    chart.draw( dataView, options);
}
const updateRuntimeGraph = async ( updateData = false) => {
    if( !graphData || updateData){
        responseData = await queryData({
            projection: {
                _id: 0,
                title: 1,
                number_runtime : {
                    $convert: {
                        input: "$runtime", to: "decimal",
                        onError: 0, onNull: 0
                    }
                }
            },
            sort: {
                number_runtime: -1
            },
            limit: maxElements
        });

        if( responseData.error || ! responseData.data || ! responseData.data.data) return;

        graphData = responseData.data.data;
    }
    
    let dataArray = [
        [ "Movie" , "Duración", { role: "style"}]
    ];

    for( let i = 0; i < graphData.length; i ++){
        
        let color;
        if( colors[i] )
            color = colors[i];
        else{
            color = "#" + Math.floor(Math.random()*16777215).toString(16);
            colors.push( color );
        }
        let value = graphData[i];
        dataArray.push(
            [ (value.title) ? (value.title) : "Indefinido",
            parseFloat(value.number_runtime.$numberDecimal), 
              color
            ]
        ) 
    }
    const dataTable = new google.visualization.arrayToDataTable(
        dataArray
    );
    const dataView = new google.visualization.DataView(dataTable);
    dataView.setColumns([ 0, 1, {
        calc: "stringify",
        sourceColumn: 1,
        type: "string",
        role: "annotation"
    }, 2]);

    let options = {
        title:'Películas por duración en minutos',
        bar:{
            groupWidth: "95%"
        },
        legend:{
            position: "none"
        }
    };
    let chart = new google.visualization.BarChart(
        document.getElementById("RuntimeChart")
    )
    google.visualization.events.addListener(chart, 'ready', function () {
        document.getElementById("DownloadLink").href = chart.getImageURI();
    });
    chart.draw( dataView, options);
}
const updateKeywordsGraph = async ( updateData = false) => {
    if( !graphData || updateData){
        responseData = await queryData({
            group_by: {
                group_field: "Keywords",
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
                frequency: -1
            },
            limit: maxElements
        });

        if( responseData.error || ! responseData.data || ! responseData.data.data) return;

        graphData = responseData.data.data;
    }
    
    let dataArray = [
        [ "Palabra" , "Frecuencia", { role: "style"}]
    ];

    for( let i = 0; i < graphData.length; i ++){
        
        let color;
        if( colors[i] )
            color = colors[i];
        else{
            color = "#" + Math.floor(Math.random()*16777215).toString(16);
            colors.push( color );
        }
        let value = graphData[i];
        dataArray.push(
            [ (value._id.name) ? (value._id.name) : "Indefinido",
              value.frequency, 
              color
            ]
        ) 
    }
    const dataTable = new google.visualization.arrayToDataTable(
        dataArray
    );
    const dataView = new google.visualization.DataView(dataTable);
    dataView.setColumns([ 0, 1, {
        calc: "stringify",
        sourceColumn: 1,
        type: "string",
        role: "annotation"
    }, 2]);

    let options = {
        title:'Palabras clave frecuentes',
        is3D: true
    };
    let chart = new google.visualization.PieChart(
        document.getElementById("KeywordsChart")
    )
    google.visualization.events.addListener(chart, 'ready', function () {
        document.getElementById("DownloadLink").href = chart.getImageURI();
    });
    chart.draw( dataView, options);
}

window.addEventListener("load", async () => {

    $('a[data-toggle="list"]').on('shown.bs.tab', function (e) {
        const eTarget = ((String)(e.target)).match(/.*#(.*)$/);
        const tab = (eTarget && eTarget.length == 2) ? eTarget[1] : "";
        let chart_code = 0;
        switch( tab ){
            case "Genres":{
                chart_code = 1;
                break;
            }
            case "Companies":{
                chart_code = 2;
                break;
            }
            case "Languages":{
                chart_code = 3;
                break;
            }
            case "PopularGenres":{
                chart_code = 4;
                break;
            }
            case "Runtime": {
                chart_code = 5;
                break;
            }
            case "Keywords": {
                chart_code = 6;
                break;
            }
        }
        
        let update = false;
        if( chart_code != current_chart_code){
            update = true;
            current_chart_code = chart_code
        }

        updateCurrentChart( update );
      });

    google.charts.load('current', {'packages':['corechart']});
    google.charts.setOnLoadCallback( () => {
        charts_loaded = true;
        updateCurrentChart( true );
    });
})

window.addEventListener("resize", () => {
    updateCurrentChart();
})