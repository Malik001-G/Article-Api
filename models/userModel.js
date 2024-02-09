const mongoose = require("mongoose");
const validator = require("validator");
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please tell us your name!"],
        minLength: 3,
    },
    email: {
        type: String,
        required: [true, "Please tell us your email!"],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Please provide a valid email"]
    },
    photo: {
        type: String,
        default: "default.jpg"
    },
    password: {
        type: String,
        required: [true, "Please provide a password"],
        minLength: 8,
        select: false, // we don't want the password to show on Postman but it will show in our db
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        validate: {
            validator: (el) => {
                return el === this.password
            },
            message: "Password does not match"
        } // this function is a validator package to check the validity of the password
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    active: {
        type: Boolean,
        default: true,
        select: false,
    },

});

const User = mongoose.model("User", userSchema);

module.exports = User;