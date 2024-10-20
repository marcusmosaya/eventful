const express=require('express');
const Payment=require('../controllers/Payment');
const router=express.Router();
const Middleware=require('../middlewares/Auth');

router.post('/paypal/create-order',Middleware.authenticate,Payment.createOrder);
router.post('/paypal/capture-order',Middleware.authenticate,Payment.captureOrder);
router.post('/mpesa',Middleware.authenticate,Payment.mpesa);
module.exports=router;