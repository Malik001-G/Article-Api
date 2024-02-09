const mongoose = require("mongoose");

const wikiSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Please provide a title"],
        unique: true,
        minlenght: 3,
        maxlength: 20,
    },
    content: {
        type: String,
        required: [true, "Please provide a content"],
        minlenght: 3,
    },
    author: {
        type: String,
        required: [true, "Please provide Author name"],
        minlenght: 3,
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false,
    }
})

const Wiki = mongoose.model("Wiki", wikiSchema)

module.exports = Wiki;