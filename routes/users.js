var express = require('express');
var userRouter = express.Router();
const usercontroller=require("../controllers/usercontrollers")
const auth=require('../middlewares/userAuth')
const productcontroller=require('../controllers/productcontrollers')


userRouter.get('/',usercontroller.loadhome)
userRouter.get('/sign-up',usercontroller.loadsign_up)
userRouter.get('/login',usercontroller.loadLogin)
userRouter.post('/sign-up',usercontroller.insertuser)
userRouter.get('/varify',usercontroller.loadvarify)
userRouter.post('/login',usercontroller.login)
userRouter.post('/varify',usercontroller.otpvarify)
userRouter.get('/shop',usercontroller.loadshop)
userRouter.get('/product-detail',productcontroller.loadProductdetails)
userRouter.get('/logout',usercontroller.userLogout)







module.exports = userRouter;

