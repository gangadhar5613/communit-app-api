var express = require('express');
var router = express.Router();
const jwt = require('../modules/token');
const User = require('../models/User');




/* GET getting the profile info */

router.get('/:username',async(req,res,next) => {
    const username = req.params.username;
     try {
         const user = await User.findOne({username:username});
         res.json({profile:profileView(user)})
     } catch (error) {
         next(error)
     }

})



















/* PUT updating the user */

router.put('/:username',jwt.verifyJwt,async(req,res,next) => {

const currentUser = req.user;
const username = req.params.username;
        try {
            
          if(username == currentUser.username){
              const user = await User.findOneAndUpdate({username:username},req.body.user,{new:true});
                res.json({profile:profileView(user)});
          }else{
              res.status(401).json({message:'You are not authorized to edit the profile'})
          }

        } catch (error) {
            next(error);
        }



})













//function to show the users profile

function profileView(user){
    return{
        name:user.name,
        username:user.username,
        image:user.image,
        bio:user.bio

    }
}



module.exports = router;