const User = require('../models/usermodel')

const isLogin = async (req,res,next)=>{
    try {
        
        if(req.session.user_id){
            const blockedUser = await User.findOne({ _id: req.session.user_id });
            if(blockedUser.is_block == 0){
                next()
            }else{
                req.session.user_id = false;
                req.session.name = false;
                res.redirect('/')
            }
        }else{
            res.render('user/userlogin',{lay:false})
        }
      

    } catch (error) {
        console.log(error);
    }
}

const isLogout = async (req,res,next)=>{
    try {
        
        if(req.session.user_id){
            res.redirect('/home')
        }else{
            next()
        }
        

    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    isLogin,
    isLogout
}