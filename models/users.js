const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  firstName: String,
  userName: String,
  password: String,
  token: String,
});

const Users = mongoose.model("users", usersSchema);

module.exports = Users;
