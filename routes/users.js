var express = require("express");
var router = express.Router();

require("../models/connection");
const User = require("../models/users");

const uid2 = require("uid2");
const bcrypt = require("bcrypt");

const { checkBody} = require("../module/tools");

// route pour enregistrer user
router.post("/signup", (req, res) => {
    if(!checkBody(req.body, ["userName", "firstName", "password"])){
      {res.json({ result: false, error : "Missing fields"}) }
      return ;
    }

   // Check if the user has not already been registered
    User.findOne({
        userName: req.body.userName,
        firstName: req.body.firstName,
    }).then((data) => {
        if (data === null) {
            const hash = bcrypt.hashSync(req.body.password, 10);

            const newUser = new User({
              firstName: req.body.firstName,
              userName: req.body.userName,
              password: hash,
              token: uid2(32),
            });

            newUser.save().then((newDoc) => {
                res.json({ result: true, token: newDoc.token });
            });
        }else {
          // le user existe déjà
          res.json({ result: false, error: "User already exists" });
        }
    });
});


// route pour chercher un user
router.post("/signin", (req, res) => {
  if(!checkBody(req.body, ["userName", "password"])){
    {res.json({ result: false, error : "Missing fields"}) }
    return ;
  }

  User.findOne({ userName: req.body.userName }).then((data) => {
      if (data && bcrypt.compareSync(req.body.password, data.password)) {
        res.json({ result: true, token: data.token, firstName: data.firstName });
      } else {
          res.json({ result: false, error: "User not found or wrong password" });
      }
  });
});

module.exports = router;
