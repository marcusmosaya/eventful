const { compare } = require('bcrypt');
const User=require('../models/User');
const Util=require('../utils/Fun')
const jwt=require('jsonwebtoken');
const Register=async (req,res)=>{
    console.log(req.body)
   let isUnique=false;
   let userId='';
   const {email,password}=req.body;
   while(!isUnique){
    userId=Util.randomString(8,'U');
    const existingUserId=await User.findOne({where:{userId:userId}});
    if(!existingUserId){
        isUnique=true;
    } 
   }
   const existingEmail=await User.findOne({where:{email:email}});
    if(existingEmail){
        return res.json({success:false,message:'A user by this email already exists'});
    }
   try {
     
     let hashedPassword=await Util.hashPassword(password);
     const newUser=await User.create({email:email,password:hashedPassword,userId:userId});
     return res.json({success:true,message:'Successfully registered a new user'});
        
   } catch (error) {
    console.log(error)
    return res.status(500).json({error:"something went wrong"});
   }


}

const Login= async (req,res)=>{
   let {email,password}=req.body;
   try{
       const existingUser=await User.findOne({where:{email:email}});
       if(!existingUser){
          return res.json({message:'This email does not exist woul you lie to register',success:false});
       }
       const validPassword=await Util.comparePassword(password,existingUser.password);
       if(validPassword){
        let user={userId:existingUser.userId}
        let token=jwt.sign(user,'qwertyuiop32223456',{expiresIn:'24h'});
        return res.json({success:true,token:token})
       }
       return res.json({success:false,message:'wrong password'});
   }catch(error){
    console.log(error);
    return res.status(500).json({error:"something went wrong"});
   }
}


module.exports={Register,Login}