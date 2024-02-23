const mongoose =require("mongoose");
require("dotenv").config();
const app = require("./app")

const DB = process.env.MONGO_URI;

mongoose.connect(DB).then(() => {
    console.log(": Database Connection Established:");
});

const port = 8080
const server = app.listen(port, () => {
    console.log(`Server up and running on PORT ${port}....`);
})