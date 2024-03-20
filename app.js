require("dotenv").config(); // to exclude files to move to git
const bodyParser = require("body-parser"); // Allows us to pass data to the body
const express = require("express");
const morgan = require("morgan"); // To get path and status code
const rateLimit = require("express-rate-limit"); // to limit the amount of request that can be made by a user to a certain endpoint
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");

// const cookieParser = require("cookie-parser");
const cors = require("cors");

//Routes Path
const wikiRouter = require("./routes/wikiRoute");
const userRouter = require("./routes/userRoute");

const appError = require("./utils/appError");
const globalErrorHandler = require("./controller/errorController");

const app = express();
app.use(bodyParser.json());

//Set security HTTP headers
app.use(helmet());
//Implement CORS
app.use(cors());
//Access-Control-Allow-Origin
app.options("*", cors());
app.use(morgan("dev")); // To show our request and status code

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000, // how long to remember request for in miliseconds
  message: "Too many requests from the IP, please try again in an hour",
});
app.use("/api", limiter);

//Data sanitization against No Sql injections
app.use(mongoSanitize());

app.use(hpp());
//Routes
app.get("/", (req, res) => {
  res.send("<h1>Welcome to article api </h1>");
});
app.use("/api/v1/wiki", wikiRouter);
app.use("/api/v1/user", userRouter);

app.all("*", (req, res, next) => {
  next(new appError(`Can't find ${req.originalUrl} on this server`, 404));
});

//Error Handling Middleware
app.use(globalErrorHandler);

module.exports = app;
