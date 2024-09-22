const {Sequelize}=require('sequelize');
const sequelize=new Sequelize('events','root','',{host:'localhost',dialect:'mysql'});
module.exports=sequelize;