require("dotenv").config();
const cors = require("cors");
const express = require("express");
const mongodb = require("mongodb");
const { MongoClient } = mongodb;
const app = express();
app.use(express.urlencoded({
    extended: true
}));
app.use(express.json());

let whitelist = process.env.ORIGIN.split(' ');
let corsOptions = {
    origin: function (origin, callback) {
        if (!origin || whitelist.indexOf(new URL(origin).hostname) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    },
    optionsSuccessStatus: 200
}
app.use(cors(corsOptions)); // Used CORS to secure origin of API requests

app.set('view engine', 'ejs');
app.use(express.static('assets'));

/* Redirect http to https */
app.get("*", function (req, res, next) {

    if ("https" !== req.headers["x-forwarded-proto"] && "production" === process.env.NODE_ENV) {
        res.redirect("https://" + req.hostname + req.url);
    } else {
        // Continue to other routes if we're not redirecting
        next();
    }

});

// Connect to MongoDB
MongoClient.connect(process.env.MONGODB_CONNECTION_STRING, {
    useUnifiedTopology: true
}).then(client => {
    console.log('Connected to Database');
    const db = client.db();
    const Details = db.collection('Details')
    app.post("/create", (req, res) => {  //Create
        Details.insertOne(req.body)
            .then(result => {
                res.redirect('/');
            })
            .catch(error => console.error(error));
    });
    app.get('/', (req, res) => { // Read
        Details.find().toArray().then(users => {
            res.render('index.ejs', { users });
        });
    });
    app.put('/update', (req, res) => { // Update
        Details.updateOne({ _id: new mongodb.ObjectId(req.body.id) },
            { $set: { name: req.body.name, phone: req.body.phone, email:req.body.email, hobbies:req.body.hobbies}
        }).then(result=>{
            if(result.modifiedCount!=0)
                res.sendStatus(202);
            else
                res.sendStatus(204);
        }).catch(error => console.error(error));
    });
    app.delete('/delete', (req, res) => { // Delete
        let deletionids=[];
        req.body.id.forEach(element => {
            deletionids.push(new mongodb.ObjectId(element));
        });
        Details.deleteMany({ _id: {$in: deletionids} })
            .then(result => {
                if (result.deletedCount == 0) {
                    return res.sendStatus(200);
                }
                else
                    res.sendStatus(202); //deleted
            })
            .catch(error => console.error(error));
    });
})
    .catch(error => console.error(error))
app.listen(process.env.PORT, () => console.log(`Listening on Port ${process.env.PORT}`));