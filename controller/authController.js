const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");

//sign In Token.. Made it a global variable instead of repeating the code on line 29
// jwt takes in three parameters - Header(it is generated automatically), payload(is the user id from the DB) and secret is Jwt secret in the .env file
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// signup controller
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm, // we are passing the data they input to the body
  });

  // the jwt token that was created up
  const token = signToken(newUser._id); // this id is our payload in the token
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
  console.log(user);

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  //3) check if everything is okay and send token to client
  const token = signToken(user._id);
  res.status(200).json({
    status: "success",
    token,
  });
});

//Protect routes that only verified users can access
exports.protect = catchAsync(async (req, res, next) => {
  //1)Getting token and check if it's there
  let token;
  if (
    req.headers.authorization && // headers as used in Postman and they are also in the browswer
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; //Bearer token.. this line gets the value after the space
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access")
    );
  }

  //2) Verification Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET); // promisify is coming from util package(check online). jwt.verify is a method that verifies the token
  console.log(decoded); // returns id, time created at and time expired at.


  //3) check if user still exists
  const freshUser = await User.findById(decoded.id);
  if (!freshUser) {
    return next(
      new AppError("The user belonging to this token does not exist", 401)
    );
  }

  //4) Check if the user changed password after token was issued
  if (freshUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError("User recently changed password! Please login again", 401)
    );
  }

  //Grant access to protected route
  req.user = freshUser;
  next();
});

//this is used for roles and permission 
exports.restrictTo = (...roles) => { // roles - the enum that is in our model
  return (req, res, next) => {
    //roles ("admin", "User", "author")
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      )
    }
  };
};
