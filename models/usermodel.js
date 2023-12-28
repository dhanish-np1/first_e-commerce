const mongoose=require('mongoose')

const userSchema=mongoose.Schema({

    fullname: {
        type: String,
        required: true
    }, 
    email:{
        type:String,
        required:true
    },
    number:{
        type:Number,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    is_verified:{
        type:Number,
        default:0
    },
    is_block:{
        type:Number,
        default:0
    },
   
    
})

const User=mongoose.model("user",userSchema)

module.exports = User;