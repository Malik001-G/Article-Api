require("dotenv").config(); // to exclude files to move to git
const bodyParser = require("body-parser"); // Allows us to pass data to the body 
const express = require("express");
const morgan = require("morgan"); // To get path and status code

//Routes Path
const wikiRouter = require("./routes/wikiRoute");
const userRouter = require("./routes/userRoute");

const appError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController")
const app = express()
app.use(bodyParser.json());


app.use(morgan("dev")); // To show our request and status code

//Routes
app.use("/api/v1/wiki", wikiRouter)
app.use("/api/v1/user", userRouter)


app.all("*", (req, res, next) => {
    next(new appError(`Can't find ${req.originalUrl} on this server`, 404))
});


//Error Handling Middleware
app.use(globalErrorHandler)

module.exports = app;