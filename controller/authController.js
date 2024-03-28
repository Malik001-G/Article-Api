const jwt = require("jsonwebtoken");
const { promisify } = require("util");

const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError");
const crypto = require("crypto");
const sendEmail = require("../utils/email");

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
    role: req.body.role
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
    req.headers.authorization && // headers as used in Postman and they are also in the browser
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1]; //Bearer token.. this line gets the value after the space
  }
  console.log(token);
  if (!token) {
    return next(
      new AppError("You are not logged in! Please log in to get access",401)
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
exports.restrictTo = (...roles) => {
  // roles - the enum that is in our model
  return (req, res, next) => {
    //roles ("admin", "User", "author")
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError("You do not have permission to perform this action", 403)
      );
    }
    next();
  };
};

exports.forgetPassword = catchAsync(async (req, res, next) => {
  //1) Get Posted Email
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError("There is no email that matches this", 404));
  }
  //2) generate random reset token
  const resetToken = user.createPasswordResetToken();
  try {
    await user.save({ validateBeforeSave: false });

    //3) sent mail to user
    const resetURL = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/resetPassword/${resetToken}`;
    const message = `Forgot password ?? Submit a patch request with your new password and passwordConfirm to: ${resetURL}.\n if you didn't forget your password kindly ignore this message`;
    console.log(message);
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Token (Valid for just 10 minutes)",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "token has been sent to the above email",
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new AppError("there was an error sending mail"),500);
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  //1) get user based token
  const hashedToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  //2) if token hasn't expired
  if (!user) {
    return next(new AppError("Token is invalid or has expired", 404));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  //3) update changed password
  await user.save();
  //4) log user in, send jwt
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  });
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  //1) Get the user from the database
  const user = await User.findById(req.user.id).select("+password");
  //User.findByAndUpdate will not work and won't validate encryption

  //2) Check if POSTed current password is correct
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError ("Your current password is wrong", 401))
  }

  //3) if so, update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // 4) log user in, send jwt
  const token = signToken(user._id);

  res.status(200).json({
    status: "success",
    token,
  })
})