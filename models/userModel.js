const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");
const crypto = require("crypto")
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name"],
    minlenght: 7,
    maxlength: 15,
  },
  email: {
    type: String,
    unique: true,
    required: [true, "Please enter your email"],
    lowercase: true,
    validate: [validator.isEmail, "Please enter a valid email"],
  },
  password: {
    type: String,
    required: [true, "Please provide a password"],
    minlenght: 8,
    select: false,
  },
  passwordConfirm: {
    type: String,
    required: [true, "Please confirm your password"],
    validate: {
      //This only works on create and save
      validator: function (el) {
        return el === this.password;
      },
      message: "Password does not match",
    },
  },
  role: {
    type: String,
    enum: ["user", "admin", "author"], // a validator to check if what you sent is part of the parameter in the list
    default: "user", //default role to user
  },
  passwordChangedAt: Date, // this is used to verify when a user changes password
  passwordResetToken: String, // the token that is sent to the user when they click on forget password
  passwordResetExpires: Date, 
});

userSchema.pre("save", async function (next) {
  //Run only when password is modified
  if (!this.isModified("password")) return next();

  //hash password with the cost of 12
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordConfirm = undefined;
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
})

//Used to compare the inputted password on Login and the password in the db (when signing up) already
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) { // the iat in the token
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt( // changes the date to integer 
      this,
      passwordChangedAt.getTime() / 1000, //changes the time to microseconds
      10
    );
    console.log(this.passwordChangedAt, JWTTimestamp);
    return JWTTimestamp < changedTimestamp; // Jwttimestamp which is the time the token was created. Make the token invalid when the time the token was created is less when the password was changed
  }
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex") // crypto is used to create a random token and it is provided by node js we don't need to install it, just require it

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  console.log({ resetToken }, this.passwordResetToken);
  
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // setting the token to expire after 10 minutes
  return resetToken;
}

const User = mongoose.model("User", userSchema);

module.exports = User;
