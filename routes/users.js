var express = require('express');
var userRouter = express.Router();
const usercontroller=require("../controllers/usercontrollers")
const auth=require('../middlewares/userAuth')


userRouter.get('/',auth.isLogout,usercontroller.loadhome)
userRouter.get('/sign-up',usercontroller.loadsign_up)
userRouter.get('/login',usercontroller.loadLogin)
userRouter.post('/sign-up',usercontroller.insertuser)
userRouter.get('/varify',usercontroller.loadvarify)
userRouter.post('/login',usercontroller.login)
userRouter.post('/varify',usercontroller.otpvarify)





module.exports = userRouter;

