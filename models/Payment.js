const {DataTypes}=require('sequelize');
const sequelize=require('../config/database');
const Event=require('../models/Event');
const User=require('../models/User');
const Payment=sequelize.define('Payment',{
    method:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    paymentId:{
        type:DataTypes.STRING,
        primaryKey:true,  
    },
    amount:{
        type:DataTypes.INTEGER,
        allowNull:false,
    },
    paymentDate:{
        type:DataTypes.DATE,
        allowNull:false,
        defaultValue:DataTypes.NOW,
    },
    status:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:'Pending',
    },
    

})
Payment.belongsTo(User);
User.hasMany(Payment);

Payment.belongsTo(Event);
Event.hasMany(Payment);


module.exports=Payment;