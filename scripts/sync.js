const sequelize=require('../config/database');
const User=require('../models/User');
const Event=require('../models/Event');
const Photo=require('../models/Photo');
const Payment=require('../models/Payment');

(
    async()=>{
        try {
            await sequelize.authenticate();
            console.log("Connection is Established");
            await sequelize.sync({force:false});
            console.log('All models synchronized successfully');

        } catch (error) {
            console.error('Unable to connect:',error);
        }finally{
            await sequelize.close()
        }
    }
)();