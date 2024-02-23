const User = require("../models/userModel");

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
