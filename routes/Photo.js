
const express=require('express');
const router=express.Router();
const Photo=require('../controllers/Photo');
const multer=require('multer');
const path=require('path');
const Middleware=require('../middlewares/Auth');
const archiver=require('archiver');
const storage=multer.diskStorage({
    destination:(req,file,cb)=>{
     let {eventId}=req.params
     cb(null,`uploads/${eventId}`);
    },
    filename:(req,file,cb)=>{
      cb(null,Date.now()+path.extname(file.originalname));
    },
  });
  const upload=multer({storage:storage,dest:'uploads/'});

router.post('/:eventId/upload',upload.array('image',100),Photo.UploadMeta);
router.get('/:eventId',Middleware.authenticate,Photo.Gallery);
router.get('/:eventId/download-zip',Photo.DownloadZip);
router.get('/:eventId/:photoId',Middleware.authenticate,Photo.PhotoView);
router.delete('/:eventId/:photoId',Middleware.authenticate,Photo.Delete);


 module.exports=router;