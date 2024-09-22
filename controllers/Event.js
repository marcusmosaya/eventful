const Event=require('../models/Event');
const fs=require('fs').promises;
const Util=require('../utils/Fun')
const Register=async (req,res)=>{

    let isUnique=false,eventId='';
    let userId=req.user.userId;
    let isAccessible;
    const{name,startDateTime,endDateTime,description,accessibility}=req.body;
    isAccessible=accessibility;
    while(!isUnique){
        eventId=Util.randomString(10,'E');
        const existingEventId=await Event.findOne({where:{eventId:eventId}});
        if(!existingEventId){
            isUnique=true;
        } 
       }
  
    
    let baseUrl=`./uploads/${eventId}`;
    try {
            const newEvent=await Event.create({name:name,startDateTime:startDateTime,endDateTime:endDateTime,description:description,accessibility:accessibility,eventId:eventId,UserUserId:userId});
            await fs.mkdir(baseUrl,{recursive:true});    
            console.log('Directory Created');
            if(isAccessible==='false'){
                let spreedsheet=await Util.createXlsxFile(eventId);
                if(spreedsheet){
                console.log('file created');
                }
            }
            return res.json({success:true,message:'Successfully registered the event'});
           
      } catch (error) {
            console.log(error)
            return res.status(500).json({error:"something went wrong"});
      }
    
}

const Read=async (req,res)=>{
    let userId=req.user.userId;
    try {
        const allEvents=await Event.findAll({where:{UserUserId:userId}});
        return res.json(allEvents);
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"something went wrong"});

    }
}

const List=async (req,res)=>{
    let userId=req.user.userId;
    try {
        const allEvents=await Event.findAll({where:{UserUserId:userId},attributes:['eventId','name']})
        return res.json(allEvents);
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"something went wrong"});
    }
}
const EventInfo=async (req,res)=>{
    let userId=req.user.userId;
    let eventId=req.params.eventId;
    console.log(eventId);
    try {
        const allEvents=await Event.findOne({where:{UserUserId:userId,eventId:eventId}})
        return res.json(allEvents);
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"something went wrong"});
    }
}
const Update=async (req,res)=>{
    let userId=req.user.userId;
    let eventId=req.params.eventId;
    let {name,description,startDateTime,endDateTime,accessibility,previousAccessibility}=req.body;
    let data={name:name,description:description,startDateTime:startDateTime,endDateTime:endDateTime,accessibility:accessibility};
    try {
        const updatedEvent=await Event.update(data,{where:{UserUserId:userId,eventId:eventId}});
        if(accessibility==='false'&&previousAccessibility==='true'){
            let spreedsheet=await Util.createXlsxFile(eventId);
            if(spreedsheet){
            console.log('file created');
            }
        }
        return res.json({success:true,message:"The event has been updated"});
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"something went wrong"});
    }
}
const Delete=async (req,res)=>{
    let userId=req.user.userId;
    let eventId=req.params.eventId;
    try {
        const deleted=await Event.destroy({where:{eventId:eventId,UserUserId:userId}})
        return res.json({success:true,message:'Successfully Cancelled'});
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"something went wrong"});
    }
}
const Accessible=async (req,res)=>{
    let eventId=req.params.eventId;
    console.log(eventId);
    try {
        const allEvents=await Event.findOne({where:{eventId:eventId},attributes:['accessibility']})
        return res.json(allEvents);
    } catch (error) {
        console.log(error)
        return res.status(500).json({error:"something went wrong"});
    }
}
const Confirm=async (req,res)=>{
    let eventId=req.params.eventId;
    let {emailPhone}=req.body;
    emailPhone=emailPhone.trim();
    let visitorExists=Util.checkRowExistsXlsx(eventId,(row)=>row.emailPhone===emailPhone);
    console.log(visitorExists);
    if(visitorExists){
        return res.json({success:true,message:'welcome'});
    }
    return res.json({success:false,message:'You are not on the list'});
}
const Visitor=(req,res)=>{
    let {eventId}=req.params;
    let {emailPhone}=req.body;
    let tempEmailPhone=emailPhone;
    let data=[];

    for (let index = 0; index < tempEmailPhone.length; index++) {
        let instance=[{emailPhone:tempEmailPhone[index]}];
        data.push(instance);
    }
    let created=Util.addRowToXlsx(eventId,data);
    if(created){
        return res.json({success:true,message:'Add Event'})
    }
    return res.json({success:false,message:'Add Event'})
}
const Remove=async (req,res)=>{
     let {eventId}=req.params;
     let {emailPhone}=req.body;
     let userId=req.user.userId;
     try {
        let isAuthorized=await Event.findOne({where:{eventId:eventId,UserUserId:userId}});
        if(isAuthorized.length<1){
            return res.json({success:false,message:'unauthorized'});
        }
        let isRemoved=Util.removeRowFromXlsx(eventId,(row)=>row.emailPhone==emailPhone);
        if(!isRemoved){
            return res.json({success:false,message:'could not delete try again later'})
        }
        return res.json({success:true,message:"You have successfully deleted the row"});
        
     } catch (error) {
        console.log(error);
        return res.status(500).json({error:"something went wrong"});
     }
}
const UpdateVisitorList=async (req,res)=>{
    let {eventId}=req.params;
    let {emailPhone}=req.body;
    let userId=req.user.userId;

    try {
       let isAuthorized=await Event.findOne({where:{eventId:eventId,UserUserId:userId}});
       if(isAuthorized.length<1){
           return res.json({success:false,message:'unauthorized'});
       }
       let isRemoved=Util.removeRowFromXlsx(eventId,emailPhone);
       if(!isRemoved){
           return req.json({success:false,meaagse:'could not delete try again later'})
       }
       return req.json({success:true,message:"You have successfully deleted the row"});
       
    } catch (error) {
       console.log(error);
       return res.status(500).json({error:"something went wrong"});
    }


}

const ReadVisitorList=async (req,res)=>{
    let {eventId}=req.params;
    let userId=req.user.userId;
    try {
       let isAuthorized=await Event.findOne({where:{eventId:eventId,UserUserId:userId}});
       if(isAuthorized.length<1){
           return res.json({success:false,message:'unauthorized'});
       }
       let visitorList=Util.readRowFromXlsx(eventId);
       return res.json(visitorList);
       
    } catch (error) {
       console.log(error);
       return res.status(500).json({error:"something went wrong"});
    }


}


module.exports={Register,Read,List,EventInfo,Update,Delete,Confirm,Accessible,Visitor,Visitor,Remove,UpdateVisitorList,ReadVisitorList};