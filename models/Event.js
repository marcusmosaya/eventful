const {DataTypes}=require('sequelize');
const sequelize=require('../config/database');
const User=require('../models/User');
const Event=sequelize.define('Event',{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    eventId:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true,
    },
    description:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    startDateTime:{
        type:DataTypes.DATE,
        allowNull:false,
    },
    endDateTime:{
        type:DataTypes.DATE,
        allowNull:false
    },
    accessibility:{
        type:DataTypes.BOOLEAN,
        allowNull:false
    }
})
Event.belongsTo(User);
User.hasMany(Event);

module.exports=Event;