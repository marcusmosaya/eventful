const path=require('path');
const archiver=require('archiver');
const Photo=require('../models/Photo');
const Event=require('../models/Event');
const Util=require('../utils/Fun');
require('dotenv').config;
const SERVER_ADDRESS="http://127.0.0.1:5000"
const DownloadZip=async (req,res)=>{
    let{eventId}=req.params;
    const directoryPath=path.join(__dirname,`../uploads/${eventId}/`);
    console.log(directoryPath);
    let event=await Event.findOne({where:{eventId:eventId},attributes:['name']});
    let eventName=event.name;
    console.log(event)
    let tempEventName=eventName.split(" ");
    let newEventName= tempEventName.join("_");
    const zipFileName=`${newEventName}.zip`;
    res.setHeader('Content-Disposition',`attachment; filename=${zipFileName}`);
    res.setHeader('Content-Type','application/zip');
    const archive=archiver('zip',{
        zlib:{level:9},
     });
    
     archive.pipe(res);
     archive.directory(directoryPath,false);
    
     archive.finalize().catch(err=>{
        console.error(err);
        res.status(500).send('could not zip directory');
     });
}

const UploadMeta=async(req,res)=>{
    let {eventId,by}=req.body;
    let isUnique=false,photoId='';
    
    console.log(`${eventId}:${by}`);
    if(!req.file){ 
        return res.status(400).json({message:'No file uploaded'});
       }
    try {
          while(!isUnique){
            photoId=Util.randomString(12,'P');
            const existingPhotoId=await Photo.findOne({where:{photoId:photoId}});
            if(!existingPhotoId){
                isUnique=true;
            } 
           }
        let path=`${SERVER_ADDRESS}/uploads/${eventId}/${req.file.filename}`;
        let name=req.file.filename.split('.')[0];
        let newPhoto=await Photo.create({name:name,photoId:photoId,by:by,path:path,EventEventId:eventId});
        res.status(200).json({message:"success"});
    } catch (error) {
        console.error(error);
        res.status(500).send('could not zip directory');
    }


}
const Gallery=async(req,res)=>{
    let userId=req.user.userId;
    let {eventId}=req.params;
    const imagePath=path.join(__dirname,'../public',`${eventId}`)
    try{
         let authirizedEvent=await Event.findOne({where:{eventId:eventId,UserUserId:userId}});
         if(authirizedEvent<1){
            return res.status({success:false,message:'Unauthorized'});
         }
         let photos=await Photo.findAll({where:{EventEventId:eventId},attributes:['path','by','photoId']});
         res.json(photos);
    }catch(error){
        console.error(error);
        res.status(500).send('something went wrong!');
    }
}

const PhotoView=async(req,res)=>{
    let userId=req.user.userId;
    let {eventId,photoId}=req.params;
    try{ 
        let authirizedEvent=await Event.findOne({where:{eventId:eventId,UserUserId:userId}});
         if(authirizedEvent<1){
            return res.status({success:false,message:'Unauthorized'});
         }
        let photo=await Photo.findOne({where:{photoId:photoId,EventEventId:eventId}});
        return res.json(photo)

    }catch(error){
        console.error(error);
        res.status(500).send('something went wrong!');
    }
}

module.exports={DownloadZip,UploadMeta,Gallery,PhotoView}