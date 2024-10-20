const paypal=require('paypal-rest-sdk');
const axios=require('axios');
const Payment=require('../models/Payment');
const fs=require('fs');
require('dotenv').config()
paypal.configure({
    'mode':'sandbox',
    'client_id':process.env.PAYPAL_CLIENT_ID,
    'client_secret':process.env.PAYPAL_CLIENT_SECRET
});


const Billing=async (eventId)=>{
    const COST_PER_FILE_SIZE_IN_MB=0.0005;
    const COST_FILE=0.05;
    let fileNumber=0,totalSize=0
    try{
        let dir=await fs.readdir(`uploads/${eventId}`);
        for await (drint of dir){
            fileNumber+=1;  
            let fileStats=await fs.stat(`uploads/${eventId}/${drint}`)
            totalSize+=fileStats.size;                
        }
        let amount=Number((COST_FILE*fileNumber).toFixed(2))+Number((COST_PER_FILE_SIZE_IN_MB*Math.ceil(totalSize/(1024*1024))));
        return amount;
    } catch(err){

        console.log(err);
        return -1;
    }
    


}


async function getAccessToken() {
    const auth=Buffer.from( `${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString('base64');
    const response=await axios.get(`${process.env.MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,{
        headers:{
            Authorization:`Basic ${auth}`
        }
    })
    return response.data.access_token;
}



const createOrder=(req,res)=>{
    const {eventId}=req.body;
    const amount=Billing(eventId)

    const payIt=JSON.stringify({
        intent:'order',
        transactions:[{
            amount:{
                currency:'USD',
                value:amount,
            }
        }]
    })
    const paymentDetails=
    JSON.stringify({
        intent:"sale",
        payer:{payment_method:'paypal'},
        redirect_urls:{
            return_url:`http://127.0.0.1:3000/success`,
            cancel_url:`http://127.0.0.1:3000/checkout`,

        },
        transactions:[{
            amount:{
                currency:"USD",
                total:amount
            }
        }]
    });
    paypal.payment.create(payIt,(err,payment)=>{
        if(err){
            console.log(err.response)
            res.status(500).json({error:'Payment failed',details:err.message});
        }else{
            const newPayment={
                method:'PAYPAL_GATE',
                paymentId:payment.id,
                amount:amount,
                UserUserId:user,
                EventEventId:eventId,
            }
        const Transaction=Payment.create(newPayment);
        console.log(Transaction)
            console.log(payment.id)
            res.json({id:payment.id});
        };
    });
}
const captureOrder=(req,res)=>{
    const {orderID}=req.body.orderID;
    paypal.payment.execute(orderID,{},(err,capture)=>{
        if (err) {
           res.status(500).json({err}); 
        }else{
            res.json(capture);
        }

    })
}
const mpesa=async (req,res)=>{
    const  {phone,eventId}=req.body;
    const user=req.user.userId;

    try {
        const accessToken=await getAccessToken();
        const timeStamp=new Date.toISOString().replace(/[-:-]/g,'').slice(0,14);
        const password=Buffer.from(process.env.MPESA_SHORTCODE+process.env.MPESA_PASS_KEY+timeStamp).toString('base64');
        const amount=Billing(eventId);
        const stkResponse=await axios.post(
            `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
            {
                BusinessShortCode:process.env.MPESA_SHORTCODE,
                password:password,
                Timestamp:timeStamp,
                TransactionType:`CustomerPayBillOnline`,
                Amount:amount,
                partyA:phone,
                partyB:process.env.MPESA_SHORTCODE,
                phoneNumber:phone,
                CallBackURL:``,
                AccountReference:`TestPayment`,
                TransactionDesc:`Payment for service`
            },
            {
                headers:{
                    Authorization:`Bearer ${accessToken}`
                }
            }
        );
        
        const newPayment={
            method:'MPESA',
            paymentId:stkResponse.data.CheckoutRequestID,
            amount:amount,
            UserUserId:user,
            EventEventId:eventId,
        }
    const Transaction=Payment.create(newPayment);
    console.log(Transaction);
      res.json({success:true,message:'Successfully Initiated'});
    } catch (error) {
        console.log(error);
        res.status(500).json({message:'Transaction failed',error})
        
    }

}



module.exports={createOrder,captureOrder,mpesa};
