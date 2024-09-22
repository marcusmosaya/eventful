const express=require('express');
const Event=require('../controllers/Event');
const Middleware=require('../middlewares/Auth');
const router=express.Router();

router.post('/',Middleware.authenticate,Event.Register);
router.get('/',Middleware.authenticate,Event.Read);
router.get('/list',Middleware.authenticate,Event.List);
router.get('/:eventId',Middleware.authenticate,Event.EventInfo);
router.put('/:eventId',Middleware.authenticate,Event.Update);
router.delete('/:eventId',Middleware.authenticate,Event.Delete);

//We need a separate router for these
router.post('/:eventId/visitors',Middleware.authenticate,Event.Visitor);
router.get('/:eventId/visitors',Middleware.authenticate,Event.ReadVisitorList);
router.delete('/:eventId/visitors',Middleware.authenticate,Event.Remove);
router.put('/:eventId/visitors',Middleware.authenticate,Event.UpdateVisitorList);
router.post('/:eventId/visitors/confirm',Event.Confirm);
router.get('/:eventId/accessible',Event.Accessible);

module.exports=router;