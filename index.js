const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient } = require("mongodb");
// const url = "mongodb://localhost:27017";
const url = "mongodb+srv://query:Query@query.thd3wks.mongodb.net/test"
const database = "querybox";
const client = new MongoClient(url);
const bodyParser = require("body-parser");
const cors = require('cors')
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors())
    // app.get('/chat',(req,res)=>{
    //     res.sendFile(__dirname)
    // })
app.post("/msg", (req, res) => {
    try {
        const name = req.body.name;
        const d = new Date()
        const date = d.toDateString()
        const time = d.toTimeString()
        const msg = req.body.msg;
        const table = "messages"
        console.log(req.body)
        console.log(date + time)
        const result = push(table, name, date, time, msg)
            // console.log(result)
        result.then(function(val) {
            console.log(val)
            if (val) {

                res.send("Query Sent, Wait for Response..!<br/>Go back and refresh the page to view your query")

            } else {
                res.send("Error pushing data")
            }
        })
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message
        };
    }
});
app.get('/msg', (req, res) => {
    const table = "messages"
    const data = show(table)
    data.then(function(val) {
        res.json(val)
    })

})
app.listen(port, () => {
    console.log("Server started at port " + port);
});
async function dbConnect(table) {
    try {
        const result = await client.connect();
        const db = result.db(database);
        return db.collection(table);
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message,
        };
    }
}
const push = async(table, name, date, time, msg) => {
    try {
        const db = await dbConnect(table);
        const result = await db.insertOne({
            name: name,
            date: date,
            time: time,
            msg: msg,
        });
        return result.acknowledged
    } catch (e) {
        // return {
        //     statusCode: 500,
        //     body: e.message,
        // };
        return e.message
    }
};
const show = async(table) => {
    try {
        const db = await dbConnect(table)
        const data = db.find({}).toArray()
        return data
    } catch (e) {
        return e.message
    }
}