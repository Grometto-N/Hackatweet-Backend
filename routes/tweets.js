var express = require('express');
var router = express.Router();

require("../models/connection");
const Tweet = require('../models/tweet');
const User = require('../models/users');

const { checkBody} = require("../module/tools");


// route pour ajouter un nouveau tweet
router.post('/add', (req, res) => {
    if(!checkBody(req.body, ["token"])){
        {res.json({ result: false, error : "Missing token"}) }
        return ;
    }

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
            newTweet.save().then(newTweet => {res.json({ result: true , tweetId : newTweet.id}) })
        }

        if(!dataUser){
            res.json({ result: false, error: 'User not find' });
        }
    })
});

// route pour charger tous les tweets
router.post('/', (req, res) => {
    if(!checkBody(req.body, ["token"])){
        {res.json({ result: false, error : "Missing token"}) }
        return ;
    }

    // on commence par chercher si l'utilisateur existe
    User.findOne({ token : req.body.token}).then(dataUser => {
        if(dataUser){
            // on cherche ensuite les tweets
            const dataToSend = [];
            Tweet.find({ }).populate('user').then(dataTweet => {
                const dataToSendTweets = []; // tableau pour envoyer ce qui nous intéresse concernant le tweet
                if(dataTweet){
                    // on récupère les informations des tweets sous forme d'un objet
                    for(let item of dataTweet){  
                        dataToSendTweets.push({
                            tweetId : item.id,
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
                }

                if(!dataTweet){
                    res.json({ result: false, error: 'Tweets not found' });
                }
            });
        }

        if(!dataUser){
            res.json({ result: false, error: 'User not found' });
        }

    });
})


// route pour charger tous les tweets vérifiant un hashtag particulier
router.post('/:hashtag', (req, res) => {
    if(!checkBody(req.body, ["token"])){
        {res.json({ result: false, error : "Missing token"}) }
        return ;
    }

    // on commence par chercher si l'utilisateur existe
    User.findOne({ token : req.body.token}).then(dataUser => {
        if(dataUser){
            // on cherche ensuite les tweets vérifiant la condition
            const hashtagSearching = `#${req.params.hashtag}`
            Tweet.find({hashtags : { "$in" : hashtagSearching }}).populate('user').then(dataTweet => {
                const dataToSendTweets = []; // tableau pour envoyer les infos qui nous intéressent dans l'objet tweet
                if(dataTweet){
                    // on récupère les informations des tweets sous forme d'un objet
                    for(let item of dataTweet){  
                        dataToSendTweets.push({
                            tweetId : item.id,
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
                }

                if(!dataTweet){
                    res.json({ result: false, error: 'Tweets not found' });
                }
            });
        }

        if(!dataUser){
            res.json({ result: false, error: 'User not found' });
        }
    });
})



// route pour mettre à jour la liste des users ayant liké le tweet
router.post('/like', (req, res) => {
    if(!checkBody(req.body, ["token","message"])){
        {res.json({ result: false, error : "Missing token"}) }
        return ;
    }
    // on cherche si le tweet existe
    Tweet.findOne({message : req.body.message }).populate('likes').then(dataTweet => {
        if(dataTweet){
            // On cherche l'id du user
            User.findOne({token : req.body.token}).then(dataUser =>{ 
                if(dataUser){
                    let  newLikes =dataTweet.likes;
                    let likedByUser = false;
                    // on vérifie si le user est déja dedans
                    if(dataTweet.likes.some(elt => elt.id === dataUser.id)){
                        // l'user est déja dedans on le supprime
                        newLikes = newLikes.filter(elt => elt.id !== dataUser.id);
                        likedByUser = false;
                        
                    }else{
                        // il n'a pas encore liké, on l'ajoute
                        newLikes.push(dataUser.id);
                        likedByUser = true;
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
                }

                if(!dataUser){
                    res.json({ result: false, error: 'User not find' });
                }
            })// fin du find sur le user
            
                
        }

        if(!dataTweet){
        res.json({ result: false, error: 'Tweets not found' });
        }

    })
})

 // route permettant de supprimer un tweet
router.delete('/one', (req, res) => { 
    if(!checkBody(req.body, ["token","id"])){
        {res.json({ result: false, error : "Missing token"}) }
        return ;
    }
    // on vérifie que le token correspond bien à un utilisateur en DB (ce qui permettra de comparer le nom)
    User.findOne({token : req.body.token}).then(dataUser =>{
        if(dataUser){
            Tweet.findOne({_id : req.body.id}).populate('user').then(dataTweet =>{
                // on vérifie que le tweet appartient bien à l'utilisateur
                if(dataUser.id === dataTweet.user.id){
                    Tweet.deleteOne({_id : req.body.id}).then(dataDelete =>{
                    res.json({ result: true})
                    })
                }

                if(dataUser.id !== dataTweet.user.id){
                    res.json({ result: false, error: "Not user's tweet" })
                }
            })
        }

        if(!dataUser){
            res.json({ result: false, error: 'User not found' });
        }
    })
})

module.exports = router;