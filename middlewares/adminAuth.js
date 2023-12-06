const isLogin = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            next()
        }else{
          
            res.render('admin/adminlogin',{lay:false,noteq:''})
        }
        
    } catch (error) {
        console.log(error);
    }
}

const isLogout = async(req,res,next)=>{
    try {
        if(req.session.admin_id){
            res.redirect('/admin/dashboard')
        }else{
            next()
        }
        
    } catch (error) {
        console.log(error);
    }
}

module.exports ={
    isLogin,isLogout
}