const express=require('express');
const sequelize=require('./config/database');
const userRoutes=require('./routes/User');
const eventRoutes=require('./routes/Event');
const photoRoutes=require('./routes/Photo');
const paymentRoutes=require('./routes/Payment');
const bodyParser=require('body-parser');
const cors=require('cors');
const app=express();
app.use(cors());
require('dotenv').config()
app.use(bodyParser.json());
app.use('/user',userRoutes);
app.use('/event',eventRoutes); 
app.use('/photo',photoRoutes);
app.use('/auth',userRoutes);
app.use('/pay',paymentRoutes);
app.use('/uploads',express.static('uploads'));

app.get('/',(req,res)=>{
   return res.send({message:"hiii"})
})

const PORT=5000;
 (async()=>{
   try {
      await sequelize.authenticate();
      
      app.listen(PORT,()=>{
         console.log('Running')
      }) 
   } catch (error) {
      console.log(error)
   }
 }

 )()

  

    

 
