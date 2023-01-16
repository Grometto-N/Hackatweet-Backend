var express = require('express');
var router = express.Router();

require("../models/connection");
const Tweet = require('../models/tweet');
const User = require('../models/users');
const Trends= require('../models/trends');


// route pour enregistrer user
router.post('/add', (req, res) => {
    // on cherche l'id de l'utilisateur
   User.findOne({ token : req.body.token}).then(dataUser => {
    console.log(dataUser)
       if(dataUser){
          // on crée un nouveau tweet
            const newTweet = new Tweet({
                user : dataUser.id,
                message: req.body.message,
                date: Date.now(),
                likes: [],
                hashtags: req.body.hashtags,
            });
          // enregistrement
          newTweet.save().then(newDoc => {res.json({ result: true , id : newDoc.id}) })
       }else{
            res.json({ result: false, error: 'User not find' });
       }

   })
 });

 // route pour charger tous les tweets
 router.get('/', (req, res) => {
    const dataToSend = [];
    Tweet.find({ }).populate('user').then(dataTweet => {
        //console.log('là', data);
        const dataToSendTweets = [];
        if(dataTweet){
            // on récupère les tweets
            for(let item of dataTweet){   
                dataToSendTweets.push({firstName : item.user.firstName, userName : item.user.userName, message : item.message, date : item.date, likes : item.likes, hashtags : item.hashtags });
            }
            // on envoie les données 
            res.json({ result: true, data : dataToSendTweets});
        }else{
            res.json({ result: false, error: 'Tweets not found' });
        }
      });

 })

 // route pour mettre à jour la liste des users ayant liké le tweet
 router.post('/like', (req, res) => {
    // on cherche si le tweet existe
    Tweet.findOne({message : req.body.message }).populate('likes').then(dataTweet => {
         if(dataTweet){
            // On cherche l'id du user
            User.findOne({token : req.body.token}).then(dataUser =>{ 
                if(dataUser){
                    let  newLikes =dataTweet.likes;
                    // on vérifie si le user est déja dedans
                    if(!dataTweet.likes.some(elt => elt.id === dataUser.id)){
                        // il n'a pas encore liké, on l'ajoute
                        newLikes.push(dataUser.id);
                     }else{
                        // l'user est déja dedans on le supprime
                        newLikes = newLikes.filter(elt => elt.id !== dataUser.id);
                    }
                    // on met à jour la DB
                    Tweet.findOneAndUpdate({message : req.body.message },{$set: {  likes : newLikes }})
                    .then(dataTweet => {
                            if(dataTweet){
                                res.json({ result: true });
                            }else{
                                res.json({ result: false, error: 'Tweets not update' });
                            } 
                    }) // fin de la mise à jour de la DB Tweet
                }else{
                    res.json({ result: false, error: 'User not find' });
                }
            })// fin du find sur le user
            
                
       }else{
        res.json({ result: false, error: 'Tweets not found' });
        }

    })

 })

module.exports = router;