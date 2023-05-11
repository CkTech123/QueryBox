const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 3000;
const bcrypt = require("bcryptjs");
const { MongoClient } = require("mongodb");
// const url = "mongodb://localhost:27017"
    const url = "mongodb+srv://CAASS:CAASScaass@caass.irtykc7.mongodb.net/test";
const client = new MongoClient(url);
const database = "caass";
const table = "register_login";
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.post("/register", async(req, res) => {
    //Register api, first of all finding the email if alredady registered or not,
    //then hashing the password and storing intt mongodb
    try {
        const db = await dbConnect(table);
        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;
        let find = await db.findOne({ email: email });
        if (find != undefined) {
            return {
                statusCode: 500,
                body: "Email Already Registered",
            };
        } else {
            const hash = bcrypt.hashSync(password, 8);
            const result = await db.insertOne({
                name: name,
                email: email,
                password: hash,
            });
            // console.log(result.acknowledged)
            if (result.acknowledged) {
                return {
                    statusbar: 200,
                    body: "User Registered",
                };
            } else {
                return {
                    statusCode: 500,
                    body: "Error in register",
                };
            }
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message,
        };
    }
});
app.post("/login", async(req, res) => {
    try {
        const email = req.body.email;
        const password = req.body.password;
        let db = await dbConnect(table);
        const info = await db.findOne({ email: email });
        // console.log(info)
        if (info != undefined) {
            if (bcrypt.compareSync(password, info.password)) {
                return {
                    statusCode: 200,
                    body: "Login Success",
                };
            } else {
                return {
                    statusCode: 500,
                    body: "Password doesn't match",
                };
            }
        } else {
            return {
                statusCode: 404,
                body: "Email Not Registered",
            };
        }
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message,
        };
    }
});

async function dbConnect(table) {
    try {
        const result = await client.connect();
        let db = result.db(database);
        return db.collection(table);
    } catch (e) {
        return {
            statusCode: 500,
            body: e.message,
        };
    }
}

app.listen(port, () => {
    console.log("Server started at port " + port);
});
