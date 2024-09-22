const {DataTypes}=require('sequelize');
const sequelize=require('../config/database');
const Event=require('../models/Event');
const Photo=sequelize.define('Photo',{
    name:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    photoId:{
        type:DataTypes.STRING,
        primaryKey:true,  
    },
    by:{
        type:DataTypes.STRING,
        allowNull:false,
        defaultValue:'unknown',
    },
    path:{
        type:DataTypes.STRING,
        allowNull:false,
    }
})
Photo.belongsTo(Event);
Event.hasMany(Photo);

module.exports=Photo;