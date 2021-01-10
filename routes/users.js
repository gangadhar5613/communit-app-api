var express = require('express');
var router = express.Router();
const User = require('../models/User');
const jwt = require('../modules/token');












/* POST user register */

router.post('/', async (req,res,next) => {

   try {
     console.log(req.body.user);
     const user = await User.create(req.body.user);
     const token = await jwt.generateJwt(req.body.user);
     res.json({user:userView(user,token)});
   } catch (error) {
     next(error);
   }
})




/* POST user login */

router.post('/login',async (req,res,next) => {
   const {email,password} = req.body.user;

   try {
     const user = await User.findOne({email:email});
     if(user.verifyPassword(password)){
        const token = await jwt.generateJwt(user);
        res.json({user:userView(user,token)})
     }
   } catch (error) {
     next(error);
   }

})



/* GET  getting current user */

router.get('/current-user',jwt.verifyJwt,async(req,res,next) => {
  const currentUser = req.user;
  const token = req.headers.authorization;
  try {
    const user = await User.findOne({email:currentUser.email});
    res.json({user:userView(user,token)})
  } catch (error) {
    next(error)
  }
});












































//function to send the user view with token
function userView(user,token){
  return{
    token:token,
    email:user.email,
    username:user.username,

  }
}







module.exports = router;
