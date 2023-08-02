var MongoClient = require('mongodb').MongoClient;
// const url = "mongodb://127.0.0.1:27017";
const url = "mongodb://172.16.114.141:27017,172.16.114.142:27017,172.16.114.143:27017"
//const url = "mongodb+srv://michele:michele@terna.ve3iw.mongodb.net";

async function main()
{

  console.log("_____INIZIO______");

MongoClient.connect(url, async function(err, db) {
  if (err) throw err;

  //const dbo = db.db("Terna");
  const dbo = db.db("test_leonardo");

  //var doc = 157501; // 157500   single ID documents
  //var insert = 2201; //2200 per 346 milioni al giorno //inserisco 800 volte per 126 million  // 64 per 1 milione // bucket compressi 

  var doc = 10; // 157500   single ID documents
  var insert = 100 ; //2200 per 346 milioni al giorno //inserisco 800 volte per 126 million  // 64 per 1 milione // bucket compressi 


  data_points = [];
  counter = 0;

  const prefix = "abcdefghijklmnhpqrstuvwxyzabc";

  const str = new Date("03-03-2023 00:00:00 AM");  //------------------------------->cambiare 
  var mydate = new Date(str);
  var mydate_next = false;

  //var _tm=mydate;
  
   console.log("Data iniziale " +mydate);

  for(var i = 1; i < insert; i++){

  // let second= 4 * 1000; // 4 seconds in milliseconds !
   let second= 2 ; // 2 seconds 
 
   if(!mydate_next)
   {
   mydate = new Date(mydate.getTime() + second);
 //  console.log("Data iniziale mydate + 4 secondi " +mydate);
  }
  else {
    mydate = new Date(mydate_next.getTime() + second);
  //  console.log("Data iniziale mydate_next + 4 secondi " +mydate);
  }
 
   // console.log("Giro data numero: " + i);
  // console.log("A");
               
  console.log("Data inserimento " +mydate );

            for(var d = 1; d < doc; d++){

             // console.log("inserisco doc numero: " + d +" di " + doc);

                              var prefix_2   = 150000+ d; 
                              var _myid = prefix + prefix_2;
                              var _tm  = mydate;
                              var _sec  = Math.floor(Math.random() * 9999999999) + 1663082044;
                              var _val  = Math.floor(Math.random() * 99999999) +  11111111;
                              var _qcod = Math.floor(Math.random() * 999) + 100;
                            // doc
                            var mydoc = { tm: _tm , 
                                          md: {ID: _myid} ,
                                        //  ID: _myid,
                                          sec: _sec, 
                                          val:_val, 
                                          qcod:_qcod
                                        };

                data_points.push(mydoc);
             //   console.log("_______tm  " + _tm);

            // if (data_points.length >= 1000 ){  //------------------------------->cambiare
            if (data_points.length >= 1 ){  //------------------------------->cambiare
          
          // await  dbo.collection("TM").insertMany(data_points);
        //  await  dbo.collection("appo").insertMany(data_points);
        await  dbo.collection("appo").insertMany(data_points);
             data_points = [];
             counter += 1 //------------------------------->cambiare
             console.log('--------- doc inserted '+ counter + " con data " + mydate );
            }
              
        
                
            }// fine if sui documenti
              // aggiorno data 
            mydate_next = _tm;
           
  }// fine primo IF 

  console.log("_____FINE_______");
  return;
  
  
})

}//main


main();


// per lanciarlo
// node --max-old-space-size=32000 /Users/michele.farinacci/Michele/MongoDB/POV/mongodbsizer/server/insert_mongo3.js
