const express=require('express');
const User=require('../controllers/User');
const router=express.Router();

router.post('/',User.Register);
router.post('/login',User.Login);
module.exports=router;