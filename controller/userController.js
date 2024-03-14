const User = require("../models/userModel");
const catchAsync = require("../utils/catchAsync")
const AppError = require("../utils/appError");


exports.getAllUsers = async (req, res) => {
  res.send("All users");
};
exports.getUser = async (req, res) => {
  res.send("One User");
};
exports.createUser = async (req, res) => {
  res.send("User Created");
};
exports.updateUser = async (req, res) => {
  res.send("User updated");
};
exports.deleteUser = async (req, res) => {
  res.send("User deleted");
};


const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.updateMe = catchAsync(async (req, res, next) => {
  // 1) Create error if user POSTs password data
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        "This route is not for password updates. Please use /updateMyPassword", 400
      )
    );
  }

  //2) Filtered out unwanted field names that are not allowed to be updated
  const filteredBody = filterObj(req.body, "name", "email");

  //3) update user document
  const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({
    status: "success",
    data: {
      user: updateUser,
    }
  })
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: "success",
    data: "null"
  });
});