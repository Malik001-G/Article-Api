const jwt = require("jsonwebtoken");

const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//sign In Token
// jwt takes in three parameters - Header(and it is generated automatically), payload(is the user id) and secret is Jwt secret in the .env file
const signToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// signup controller
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
  });

  // the jwt token that was created up
  const token = signToken(newUser._id);

  // the jwt token before wrapping it in signToken

  //   const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
  //     expiresIn: process.env.JWT_EXPIRES_IN,
  //   });

  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser,
    },
  });
});
//Login
exports.login = catchAsync(async (req, res, next) => {
  //Destructuring
  const { email, password } = req.body;

  //1) check if email and password exist
  if (!email || !password) {
    return next(new AppError("Please provide a valid email and password", 400));
  }

  //2) check if user exists && password is correct
  const user = await User.findOne({ email }).select("+password");
  const correct = await user.correctPassword(password, user.password);
  if (!user || !correct) {
    return next(new AppError("Invalid email or password", 401));
  }
  //3) check if everything is okay and send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});
