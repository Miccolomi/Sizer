var MongoClient = require('mongodb').MongoClient;
const url = "mongodb://localhost:27017";



async function main()
{

  console.log("_____INIZIO______");

MongoClient.connect(url, async function(err, db) {
  if (err) throw err;

  const dbo = db.db("Terna");

  const str = '2022-11-01 00:00:00';
  const prefix = "abcdefghijklmnhpqrstuvwxyzabc";
  var mydate = new Date(str);
  var _tm=mydate;
  
  //console.log("Data iniziale " +mydate);

  var doc = 157500; // 157500  documenti
  var insert = 800; //inserisco 800 volte

  for(var i = 0; i < insert; i++){

   let milliseconds= 4 * 1000; // 4 seconds =4000 milliseconds
 
    _tm = new Date(mydate.getTime() + milliseconds);
   
   // console.log("Giro data numero: " + i);
  // console.log("A");
               
          
            for(var d = 0; d < doc; d++){

          //    console.log("B");

                              var prefix_2   =Math.floor(Math.random() * 307500) + 150000; 
                              var _myid = prefix + prefix_2;
                                                                              
                               // console.log("ID DOC "+_myid);
                             //   console.log("Giro doc numero: " + d);
                                var _tm  = _tm;
                             //   console.log("Data inserimento " +_tm );
                                 mydate = _tm;
                                var _sec  = Math.floor(Math.random() * 9999999999) + 1663082044;
                                var _val  = Math.floor(Math.random() * 99999999) +  11111111;
                                var _qcod = Math.floor(Math.random() * 999) + 100;
                // doc
                var mydoc = { tm: _tm , md: {ID: _myid} ,sec: _sec, val:_val, qcod:_qcod};
             //   console.log("_______tm  " + _tm);

          //   try{
              await   dbo.collection("TM_v5").insertOne(mydoc);
         //     console.log("Document inserted ");
        //   }
          // catch (e){
            // console.log("ERRORE ")+e;
            // db.close();
            // return; 
          
          // }
              
           prefix_2="";
           _myid="";
         //  _tm = "";
          // mydate="";
           _sec="";
           _val="";
           _qcod="";
                
            }// fine if sui documenti
           
  }// fine primo IF 

  console.log("_____FINE_______");
  return;
  
  
})

}//main


main();


