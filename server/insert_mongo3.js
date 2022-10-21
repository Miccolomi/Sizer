var MongoClient = require('mongodb').MongoClient;
//const url = "mongodb://127.0.0.1:27017";
const url = "mongodb+srv://michele:michele@tts.ve3iw.mongodb.net/?retryWrites=true&w=majority"

async function main()
{

  console.log("_____INIZIO______");

MongoClient.connect(url, async function(err, db) {
  if (err) throw err;

  const dbo = db.db("terna3");

  var doc = 10000; // 157500   single documents
  var insert = 2250; //inserisco 800 volte per 126 million  // 64 per 1 milione // bucket compressi 

  data_points = [];
  counter = 0;

  const prefix = "abcdefghijklmnhpqrstuvwxyzabc";

  const str = new Date("1-02-2022 01:00:00 AM");  
  var mydate = new Date(str);
  var mydate_next = false;

  //var _tm=mydate;
  
   console.log("Data iniziale " +mydate);

  for(var i = 0; i < insert; i++){

   let second= 4 * 1000; // 4 seconds in milliseconds !
 
   if(!mydate_next)
   {
   mydate = new Date(mydate.getTime() + second);
   console.log("Data iniziale mydate + 4 secondi " +mydate);
  }
  else {
    mydate = new Date(mydate_next.getTime() + second);
  //  console.log("Data iniziale mydate_next + 4 secondi " +mydate);
  }
 
   // console.log("Giro data numero: " + i);
  // console.log("A");
               
  console.log("Data inserimento " +mydate );

            for(var d = 0; d < doc; d++){

          //    console.log("B");

                              var prefix_2   = 150000+ d; 
                              var _myid = prefix + prefix_2;
                                                                              
                               // console.log("ID DOC "+_myid);
                             //   console.log("Giro doc numero: " + d);
                             
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

             if (data_points.length >= 1000 ){ ////>= da provare !!!!!!!!!
          
           await  dbo.collection("tm3").insertMany(data_points);
             data_points = [];
             counter += 1000
             console.log(' doc inserted '+ counter);
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


