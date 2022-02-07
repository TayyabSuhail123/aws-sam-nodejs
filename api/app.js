const express = require('express')
const app = express()
var AWS = require('aws-sdk');
const router = express.Router()
const bodyParser = require('body-parser')
const cors = require('cors')
const path = require('path')
require('dotenv').config();



console.log("The enviroment used is??:"+process.env.environment);
var ddb=null;


if(process.env.environment==="development")
{
console.log("Inside dev setup");
ddb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://dynamodb:8000'),region: 'eu-east-2'});

}
else if(process.env.environment==="local")
{
    ddb = new AWS.DynamoDB({ endpoint: new AWS.Endpoint('http://localhost:8000'),region: 'eu-east-2'});
}
else
{
    console.log("Inside prod setup");
    ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
}

let FruitBox = [];

//Static content ie images
app.use('/static', express.static('static'))

router.use(cors())
router.use(bodyParser.json())
router.use(bodyParser.urlencoded({ extended: true }))

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));



router.get("/cars", async (req, res) => {
    var params = {
        TableName: "Cars",
        ProjectionExpression: "#id, #name, #type, #manufacturer, #fuel_type, #description",
        ExpressionAttributeNames: {
            "#id": "id",
            "#name": "name",
            "#type": "type",
            "#manufacturer": "manufacturer",
            "#fuel_type": "fuel_type",
            "#description": "description"
        }
    };
    try {
        console.log("Trying to read data from db");
        ddb.scan(params, onScan);
    function onScan(err, data) {
        console.log("Inside Scan");
        console.log(err);
        console.log("********************");
        console.log(data);
        console.log("********************");
        if (err) {
            console.log("Unable to scan the table. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            res.send(data)
            // print all the Cars
            console.log("Scan succeeded.");
            data.Items.forEach(function(car) {
               console.log(car.id, car.type, car.name)
            });
    if (typeof data.LastEvaluatedKey != "undefined") {
                console.log("Scanning for more...");
                params.ExclusiveStartKey = data.LastEvaluatedKey;
                ddb.scan(params, onScan);
            }
        }
      }
        
    } catch (error) {
        console.log("Error encountered is")
        console.log(error);
        
    }
});

router.put('/cars', async (req, res) => {
    try {
        console.log(process.env.environment);
        var uuid=generateRowId(4);
         var car = req.body;     
         console.log(car);   
         console.log(uuid);
         var id=uuid+"";
         var params = {
             TableName:'Cars',
             Item: {
               "id":{"S":""+id},
               "type":{"S":car.type} ,
               "name":{"S":car.name} ,
               "manufacturer":{"S":car.manu} ,
               "fuel_type":{"S":car.typefuel} ,
               "description":{"S":car.desc} 
           }
         
         };
     
         var data;
         var msg;
         
         try{
             data = await ddb.putItem(params).promise();
             console.log("Item entered successfully:", data);
             msg = 'Item entered successfully';
         } catch(err){
             console.log("Error: ", err);
             msg = err;
         }
     
     
         var response = {
             'statusCode': 202,
             'body': JSON.stringify({
                 message: msg
         }),
     };
 } catch (err) {
     console.log(err);
     return err;
 }

    res.send(response)

})

var CUSTOMEPOCH = 1300000000000; // artificial epoch
function generateRowId(shardId /* range 0-64 for shard/slot */) {
  var ts = new Date().getTime() - CUSTOMEPOCH; // limit to recent
  var randid = Math.floor(Math.random() * 512);
  ts = (ts * 64);   // bit-shift << 6
  ts = ts + shardId;
  return (ts * 512) + randid;
}

app.use('/', router)


if(process.env.environment==="local")
{
    const port = 3000
    app.listen(port)
    console.log(`listening on http://localhost:${port}`)
    
}

else
{
    module.exports = app;
}
