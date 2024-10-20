const jwt=require('jsonwebtoken');

const authenticate=(req,res,next)=>{
      const token=req.headers.authorization && req.headers.authorization.split(' ')[1];
      if(!token){
        return res.status(401).json({success:false,message:'Access token is missing'});
      }
      jwt.verify(token,'qwertyuiop32223456',(err,user)=>{
        if (err) {
            console.log(err);
            return res.status(403).json({message:'Seems like our token expired'});
        }
        req.user=user;
        next();
      });
};

module.exports={authenticate};