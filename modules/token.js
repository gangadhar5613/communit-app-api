const jwt = require('jsonwebtoken');


exports.generateJwt = async function(user){
    const payload = {username:user.username,email:user.email};

   try {
    const token = await jwt.sign(payload,process.env.SECRET);
     return token;
   } catch (error) {
       next(error)
   }
}



exports.verifyJwt = async (req,res,next) => {

    const token = req.headers.authorization;

    if(token){
        try {
            const payload = await jwt.verify(token,process.env.SECRET);
            req.user = payload;
            next();
        } catch (error) {
            next(error)
        }
    }else{
        res.status(401).json({message:'Token required for validation'})
    }
}