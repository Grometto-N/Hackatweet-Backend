var express = require('express');
var router = express.Router();

require("../models/connection");
const Tweet = require('../models/tweet');
const User = require('../models/users');
const Trends= require('../models/trends');


// route pour ajouter un nouveau tweet
router.post('/add', (req, res) => {
    // on cherche l'id de l'utilisateur
   User.findOne({ token : req.body.token}).then(dataUser => {
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
 router.post('/', (req, res) => {
    // on commence par chercher si l'utilisateur existe
    User.findOne({ token : req.body.token}).then(dataUser => {
        if(dataUser){
            // on cherche ensuite les tweets
            const dataToSend = [];
            Tweet.find({ }).populate('user').then(dataTweet => {
                const dataToSendTweets = [];
                if(dataTweet){
                    // on récupère les informations des tweets sous forme d'un objet
                    for(let item of dataTweet){  
                        // vérification si l'utilisateur a liké ce tweet
                        dataToSendTweets.push({
                            firstName : item.user.firstName, 
                            userName : item.user.userName, 
                            message : item.message, 
                            date : item.date, 
                            likes : item.likes, 
                            isLikedByUser : item.likes.includes(dataUser.id),
                            isUserTweet : (item.user.userName === dataUser.userName),
                            hashtags : item.hashtags });
                    }
                    // on envoie les données au frontend
                    res.json({ result: true, data : dataToSendTweets});
                }else{
                    res.json({ result: false, error: 'Tweets not found' });
                }
              });
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
                    let likedByUser = false;
                    // on vérifie si le user est déja dedans
                    if(!dataTweet.likes.some(elt => elt.id === dataUser.id)){
                        // il n'a pas encore liké, on l'ajoute
                        newLikes.push(dataUser.id);
                        likedByUser = true;
                     }else{
                        // l'user est déja dedans on le supprime
                        newLikes = newLikes.filter(elt => elt.id !== dataUser.id);
                        likedByUser = false;
                    }
                    // on met à jour la DB
                    Tweet.findOneAndUpdate({message : req.body.message },{$set: {  likes : newLikes }})
                    .then(dataTweet => {
                            if(dataTweet){
                                const nbLike = likedByUser ? dataTweet.likes.length +1 : dataTweet.likes.length -1;
                                res.json({ result: true , likedByUser : likedByUser, nbLike : nbLike});
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