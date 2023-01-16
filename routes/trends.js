var express = require('express');
var router = express.Router();

require("../models/connection");
const Tweet = require('../models/tweet');
const User = require('../models/users');
const Trend= require('../models/trends');

// route pour enregistrer un trend ou le mettre à jour en DB
router.post('/add', (req, res) => {
    // on cherche si le hashtag existe
    Trend.findOneAndUpdate({ hashtag : req.body.hashtag},{'$push': {tweets
    : req.body.idTweet}}).then(dataTrends => {
        if(!dataTrends){
          //on crée le trend
            const newTrend = new Trend({
            hashtag : req.body.hashtag,
            tweets: [req.body.idTweet],
            });
            // enregistrement
            newTrend.save().then(newTrend => {newTrend !== null ? res.json({ result: true}) : res.json({ result: false}) })
        }else{
            {res.json({ result: true}) }
        }
    })
 });

 // route pour récupérer tous les trends o
router.get('/all', (req, res) => {
    Trend.find({ }).then(dataTrends => {
        console.log('trends', dataTrends);
        if(dataTrends){
            // on envoie les données 
            res.json({ result: true, trends : dataTrends});
        }else{
            res.json({ result: false, error: 'Trends not found' });
        }
      });
})

module.exports = router;