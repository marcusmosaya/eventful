const {DataTypes}=require('sequelize');
const sequelize=require('../config/database');
const User=sequelize.define('User',{
    email:{
        type:DataTypes.STRING,
        allowNull:false,
        unique:true,
    },
    password:{
        type:DataTypes.STRING,
        allowNull:false,
    },
    userId:{
        type:DataTypes.STRING,
        allowNull:false,
        primaryKey:true,
    }
})

module.exports=User