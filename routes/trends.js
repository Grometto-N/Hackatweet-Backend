var express = require('express');
var router = express.Router();

require("../models/connection");
const Tweet = require('../models/tweet');
const User = require('../models/users');
const Trend= require('../models/trends');

// route pour mettre à jour en DB un trend ou le rajouter s'il n'existe pas encore
router.post('/add', (req, res) => {
    Trend.updateMany({ "hashtag": { "$in" : req.body.hashtags } },
        { "$push" : {tweets : req.body.idTweet}},
        {upsert : true},
        ).then(dataTrends => {
            {res.json({ result: true}) }
        })
 });

 // route pour récupérer tous les trends o
router.get('/all', (req, res) => {
    Trend.find({ }).then(dataTrends => {
        if(dataTrends){
            // on envoie les données 
            res.json({ result: true, trends : dataTrends});
        }else{
            res.json({ result: false, error: 'Trends not found' });
        }
      });
})

module.exports = router;