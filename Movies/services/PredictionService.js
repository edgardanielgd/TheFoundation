const tf = require("@tensorflow/tfjs");

class PredictionService {
    constructor(mongoClient,dbName,dbCollection){
        this.mongoClient = mongoClient;
        this.db = this.mongoClient.db(dbName);
        this.Collection = this.db.collection(dbCollection);
        this.dbName = dbName;
        this.dbCollection = dbCollection;
    }

    train = async ( data ) => {
        ///*
        const genData = async () => {
            const xs = [];
            const ys = [];
            let count = 0;
            await data.forEach(row => {
                //if( ++count > 20)return;
                const rowArray = [];
                if( row.budget && row.budget != "0" )
                    rowArray.push( parseFloat(row.budget) );
                else
                    rowArray.push( 10000000 );
                if( row.popularity && row.popularity != "0")
                    rowArray.push( parseFloat(row.popularity) );
                else
                    rowArray.push( 5 );
                if( row.runtime && row.runtime != "0")
                    rowArray.push( parseFloat(row.runtime) );
                else
                    rowArray.push( 60 );
                let revenue = 0;
                if( row.revenue && row.revenue != "0")
                    revenue = parseFloat(row.revenue);
                else
                    revenue = 1000000;
                //console.log( rowArray, revenue);
                xs.push( tf.tensor(rowArray) );
                ys.push( tf.tensor(revenue) );
            });
            return {
                xs: tf.stack( xs ),
                ys: tf.stack( ys )
            }
        }
        const {xs, ys} = await genData( data );
        
        const model = tf.sequential({
            layers: [
                tf.layers.dense({inputShape: [3], units: 1,activation: 'relu'}),
                //tf.layers.dense({units: 1, activation: 'softmax'}),
            ]
        });
        model.compile({
            optimizer: 'adam',
            loss: 'meanSquaredError'
        })
        
        await model.fit(xs, ys, {
            epochs: 20,
        }).then( info => {
            console.log( "Final accuracy: "+ JSON.stringify(info.history));
        });

        this.model = model;
        console.log( await this.model.predict( tf.tensor([13000000,6,112],[1,3])).array() );
        //*/

        /*
        const xs = tf.stack([
            tf.tensor(40),
            tf.tensor(43),
            tf.tensor(45)
        ]);
        const ys = tf.stack([
            tf.tensor(9.0),
            tf.tensor(13.0),
            tf.tensor(16.0)
        ]);
        const model = tf.sequential({
            layers: [
              tf.layers.dense({inputShape: [3], units: 32, activation: 'relu'}),
              tf.layers.dense({units: 1, activation: 'softmax'}),
            ]
           });
        
        model.compile({
            optimizer: 'sgd',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        })
        
        await model.fit(xs, ys, {
            batchSize: 32,
            epochs: 5
        });
        console.log( model.summary() );
        this.model = model;

        console.log( "Successfully trained");

        console.log( await this.model.predict( 
            tf.tensor([40])
        ).array()
        );//*/
        /*const model = tf.sequential({
            layers: [
              tf.layers.dense({inputShape: [784], units: 32, activation: 'relu'}),
              tf.layers.dense({units: 1, activation: 'softmax'}),
            ]
           });
           model.compile({
            optimizer: 'sgd',
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
          });
        const dataT = tf.randomNormal([100, 784]);
        const labels = tf.randomUniform([100, 1]);
        labels.print();

        function onBatchEnd(batch, logs) {
            console.log('Accuracy', logs.acc);
        }

        // Train for 5 epochs with batch size of 32.
        await model.fit(dataT, labels, {
                epochs: 5,
                batchSize: 32,
                callbacks: {onBatchEnd}
            }).then(info => {
                console.log('Final accuracy', info.history.acc);
        });

        const prediction = model.predict(tf.randomNormal([3, 784]));
        prediction.print();*/
    }

    predict = ( param_id ) => {
        const model = this.model;
        if( !model ){
            resolve({
                error : "Model is not ready yet"
            });
        }
        return new Promise( async (resolve, reject) => {
            try{
                if( !param_id ){
                    resolve({
                        error : "No id provided"
                    });
                    return;
                }
                const data = await this.Collection.findOne(
                    {
                        $or: [
                            {"id" : { $eq: param_id.toString() } },
                            {"id" : { $eq: parseInt( param_id ) } }
                        ]
                    }
                );
                if( !data ){
                    resolve({
                        error: "Could not find any data matching with provided id"
                    });
                    return;
                }

                const prediction = await model.predict( tf.tensor([
                    parseFloat(data.budget),
                    parseFloat(data.popularity),
                    parseFloat(data.runtime)
                ], [1,3])).array();

                if( prediction.length == 1 && prediction[0].length == 1){
                    resolve({
                        data: prediction[0][0],
                        title: data.title,
                        budget: data.budget,
                        popularity: data.popularity,
                        runtime: data.runtime,
                    });
                }else{
                    resolve({
                        error: "No correct format found"
                    })
                }

            }catch( e ){
                console.log( e );
                resolve({
                    error: e.message
                })
            }

        })
    }

}

module.exports = PredictionService;