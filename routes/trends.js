var express = require('express');
var router = express.Router();

require("../models/connection");
const User = require('../models/users');
const Trend= require('../models/trends');

const { checkBody} = require("../module/tools");

// route pour mettre à jour en DB un trend ou le rajouter s'il n'existe pas encore
router.post('/add', (req, res) => {
    if(!checkBody(req.body, ["token", "idTweet", "hashtags"])){
        {res.json({ result: false, error : "Missing fields"}) }
        return ;
    }

    User.findOne({ token : req.body.token}).then(dataUser => {
        if(dataUser){
            req.body.hashtags.forEach(elt =>{
                Trend.updateOne(
                    { "hashtag": elt }, // filtre
                    { "$push" : {tweets : req.body.idTweet}},    // update
                    {upsert : true},                            // création du doc si besoin
                ).then();
            })           
            {res.json({ result: true}) }
    //     }
        }

        if(!dataUser){
            {res.json({ result: false, error : "User not found"}) }
        }
     });
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


// route pour mettre à jour en DB un trend en supprimant le tweet de 
router.post('/update', (req, res) => {
    if(!checkBody(req.body, ["token", "idTweet", "hashtags"])){
        {res.json({ result: false, error : "Missing fields"}) }
        return ;
    }

    User.findOne({ token : req.body.token}).then(dataUser => {
        if(dataUser){
            Trend.find( { "hashtag": { "$in" : req.body.hashtags } })
            .then(dataTrend =>{
                dataTrend.forEach(elt =>{
                    // on cherche si on doit supprimer le document ou juste le mettre à jour
                    if(elt.tweets.length === 1){
                        Trend.deleteOne(
                            { "hashtag": elt.hashtag },                         // filtre
                        ).then();
                    }

                    if(elt.tweets.length !== 1){
                        Trend.updateOne(
                            { "hashtag": elt.hashtag },                         // filtre
                            { "$pull" : {tweets : req.body.idTweet}},   // update
                        ).then();
                    }
                })
            })
            {res.json({ result: true}) }                 
        }

        if(!dataUser){
            {res.json({ result: false, error : "User not found"}) }
        }
    })
 });

module.exports = router;