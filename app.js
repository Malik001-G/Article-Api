require("dotenv").config(); // to exclude files to move to git
const bodyParser = require("body-parser"); // Allows us to pass data to the body 
const express = require("express");
const morgan = require("morgan"); // To get path and status code

const wikiRouter = require("./routes/wikiRoute");
const app = express()
app.use(bodyParser.json());


app.use(morgan("dev")); // To show our request and status code

//Routes

app.use("/api/v1/wiki", wikiRouter)

module.exports = app;